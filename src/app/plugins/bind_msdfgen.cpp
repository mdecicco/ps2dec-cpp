#include <bind/Namespace.hpp>
#include <bind/Registry.hpp>
#include <render/vulkan/CommandBuffer.h>
#include <render/vulkan/CommandPool.h>
#include <render/vulkan/LogicalDevice.h>
#include <render/vulkan/Queue.h>
#include <render/vulkan/Texture.h>
#include <tspp/utils/Callback.h>
#include <tspp/utils/Docs.h>
#include <tspp/utils/Thread.h>
#include <utils/Exception.h>

#include <msdf-atlas-gen/msdf-atlas-gen.h>

namespace decomp {
    struct FontGlyph {
        public:
            u32 codepoint;
            f32 u0, v0, u1, v1;
            f32 advance;
            f32 bearingX, bearingY;
            f32 width, height;
    };

    struct FontKerning {
        public:
            u32 codepoint1;
            u32 codepoint2;
            f32 kerning;
    };

    struct FontAtlas {
        public:
            render::vulkan::Texture* texture;
            utils::Array<FontGlyph> glyphs;
            utils::Array<FontKerning> kerning;
            f32 scale;
            f32 pixelRange;
            u32 width, height;
            f32 ascender, descender;
            f32 lineHeight;
            f32 emSize;
    };

    FontAtlas* loadFontInternal(
        const utils::String& fontPath,
        const msdf_atlas::Charset& charset,
        render::vulkan::LogicalDevice* device,
        render::vulkan::CommandPool* cmdPool
    ) {
        f32 pixelRange = 6.0f;

        msdfgen::FreetypeHandle* ft = msdfgen::initializeFreetype();
        if (!ft) {
            throw GenericException("Failed to initialize Freetype");
        }

        msdfgen::FontHandle* font = msdfgen::loadFont(ft, fontPath.c_str());
        if (!font) {
            throw FileException("Failed to load font");
        }

        std::vector<msdf_atlas::GlyphGeometry> glyphs;
        msdf_atlas::FontGeometry geometry(&glyphs);

        geometry.loadCharset(font, 1.0, charset);

        for (msdf_atlas::GlyphGeometry& glyph : glyphs) {
            glyph.edgeColoring(&msdfgen::edgeColoringInkTrap, 3.0, 0);
        }

        msdf_atlas::TightAtlasPacker packer;
        packer.setDimensionsConstraint(msdf_atlas::DimensionsConstraint::SQUARE);
        packer.setMinimumScale(64.0f);
        packer.setPixelRange(pixelRange);
        packer.setSpacing(6);
        packer.setMiterLimit(1.0);
        packer.pack(glyphs.data(), glyphs.size());

        i32 width = 0, height = 0;
        packer.getDimensions(width, height);

        msdf_atlas::ImmediateAtlasGenerator<
            f32,
            4,
            msdf_atlas::mtsdfGenerator,
            msdf_atlas::BitmapAtlasStorage<msdf_atlas::byte, 4>>
            generator(width, height);

        msdf_atlas::GeneratorAttributes attrs;
        generator.setAttributes(attrs);
        generator.setThreadCount(tspp::Thread::MaxHardwareThreads());
        generator.generate(glyphs.data(), glyphs.size());

        msdf_atlas::BitmapAtlasStorage<msdf_atlas::byte, 4> storage = generator.atlasStorage();
        u8* pixels = (u8*)msdfgen::BitmapConstRef<msdf_atlas::byte, 4>(storage).pixels;

        FontAtlas* atlas  = new FontAtlas();
        atlas->texture    = new render::vulkan::Texture(device);
        atlas->scale      = packer.getScale();
        atlas->pixelRange = pixelRange;
        atlas->width      = width;
        atlas->height     = height;

        // Extract font metrics for proper baseline positioning
        msdfgen::FontMetrics fontMetrics;
        msdfgen::getFontMetrics(fontMetrics, font);
        atlas->ascender   = fontMetrics.ascenderY;
        atlas->descender  = fontMetrics.descenderY;
        atlas->lineHeight = fontMetrics.lineHeight;
        atlas->emSize     = fontMetrics.emSize;

        msdfgen::destroyFont(font);
        msdfgen::deinitializeFreetype(ft);

        if (!atlas->texture->init(width, height, VK_FORMAT_R8G8B8A8_SRGB)) {
            delete atlas->texture;
            delete atlas;
            throw GenericException("Failed to initialize font texture");
        }

        if (!atlas->texture->initStagingBuffer()) {
            delete atlas->texture;
            delete atlas;
            throw GenericException("Failed to initialize font texture staging buffer");
        }

        if (!atlas->texture->initSampler(VK_FILTER_LINEAR, VK_FILTER_LINEAR)) {
            delete atlas->texture;
            delete atlas;
            throw GenericException("Failed to initialize font texture sampler");
        }

        render::vulkan::CommandBuffer* cb = cmdPool->createBuffer(true);
        if (!cb->begin(VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT)) {
            cmdPool->freeBuffer(cb);
            delete atlas->texture;
            delete atlas;
            throw GenericException("Failed to begin command buffer");
        }

        u8* texDest = (u8*)atlas->texture->getStagingBuffer()->getPointer();
        memcpy(texDest, pixels, width * height * 4);

        if (!atlas->texture->setLayout(cb, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL)) {
            cmdPool->freeBuffer(cb);
            delete atlas->texture;
            delete atlas;
            throw GenericException("Failed to set image layout to VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL");
        }

        atlas->texture->flushPixels(cb);

        if (!atlas->texture->setLayout(cb, VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL)) {
            cmdPool->freeBuffer(cb);
            delete atlas->texture;
            delete atlas;
            throw GenericException("Failed to set image layout to VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL");
        }

        if (!cb->end()) {
            cmdPool->freeBuffer(cb);
            delete atlas->texture;
            delete atlas;
            throw GenericException("Failed to end command buffer");
        }

        if (!device->getGraphicsQueue()->submit(cb)) {
            cmdPool->freeBuffer(cb);
            delete atlas->texture;
            throw GenericException("Failed to submit command buffer");
        }

        device->getGraphicsQueue()->waitForIdle();

        atlas->texture->shutdownStagingBuffer();
        cmdPool->freeBuffer(cb);

        const std::map<std::pair<int, int>, double>& kerning = geometry.getKerning();
        atlas->kerning.reserve(kerning.size());
        for (const auto& [key, value] : kerning) {
            atlas->kerning.push({u32(key.first), u32(key.second), f32(value)});
        }

        atlas->glyphs.reserve(glyphs.size(), true);
        f32 invWidth  = 1.0f / width;
        f32 invHeight = 1.0f / height;
        for (u32 i = 0; i < glyphs.size(); i++) {
            const msdf_atlas::GlyphGeometry& src = glyphs[i];
            FontGlyph& dst                       = atlas->glyphs[i];

            i32 x, y, w, h;
            src.getBoxRect(x, y, w, h);
            dst.u0        = f32(x) * invWidth;
            dst.v0        = f32(y) * invHeight;
            dst.u1        = f32(x + w) * invWidth;
            dst.v1        = f32(y + h) * invHeight;
            dst.advance   = src.getAdvance();
            dst.codepoint = src.getCodepoint();

            // Get glyph metrics for proper positioning
            double left, bottom, right, top;
            src.getQuadPlaneBounds(left, bottom, right, top);
            dst.bearingX = left;           // Left side bearing
            dst.bearingY = top;            // Top bearing (from baseline)
            dst.width    = (right - left); // Glyph width
            dst.height   = (top - bottom); // Glyph height
        }

        return atlas;
    }

    FontAtlas* loadFont(
        const utils::String& fontPath, render::vulkan::LogicalDevice* device, render::vulkan::CommandPool* cmdPool
    ) {
        msdf_atlas::Charset charset = msdf_atlas::Charset::ASCII;
        return loadFontInternal(fontPath, charset, device, cmdPool);
    }

    FontAtlas* loadFontWithCharset(
        const utils::String& fontPath,
        const Array<u32>& codepoints,
        render::vulkan::LogicalDevice* device,
        render::vulkan::CommandPool* cmdPool
    ) {
        msdf_atlas::Charset charset;
        for (u32 codepoint : codepoints) {
            charset.add(codepoint);
        }

        return loadFontInternal(fontPath, charset, device, cmdPool);
    }

    void bindMSDFGenInterface() {
        bind::Namespace* ns = new bind::Namespace("msdf");
        bind::Registry::Add(ns);

        {
            bind::ObjectTypeBuilder<FontKerning> b = ns->type<FontKerning>("FontKerning");
            b.dtor();
            b.prop("codepoint1", &FontKerning::codepoint1);
            b.prop("codepoint2", &FontKerning::codepoint2);
            b.prop("kerning", &FontKerning::kerning);
        }

        {
            bind::ObjectTypeBuilder<FontGlyph> b = ns->type<FontGlyph>("FontGlyph");
            b.dtor();
            b.prop("codepoint", &FontGlyph::codepoint);
            b.prop("u0", &FontGlyph::u0);
            b.prop("v0", &FontGlyph::v0);
            b.prop("u1", &FontGlyph::u1);
            b.prop("v1", &FontGlyph::v1);
            b.prop("advance", &FontGlyph::advance);
            b.prop("bearingX", &FontGlyph::bearingX);
            b.prop("bearingY", &FontGlyph::bearingY);
            b.prop("width", &FontGlyph::width);
            b.prop("height", &FontGlyph::height);
        }

        {
            bind::ObjectTypeBuilder<FontAtlas> b = ns->type<FontAtlas>("FontAtlas");
            b.dtor();
            b.prop("texture", &FontAtlas::texture);
            b.prop("glyphs", &FontAtlas::glyphs);
            b.prop("kerning", &FontAtlas::kerning);
            b.prop("scale", &FontAtlas::scale);
            b.prop("pixelRange", &FontAtlas::pixelRange);
            b.prop("width", &FontAtlas::width);
            b.prop("height", &FontAtlas::height);
            b.prop("ascender", &FontAtlas::ascender);
            b.prop("descender", &FontAtlas::descender);
            b.prop("lineHeight", &FontAtlas::lineHeight);
            b.prop("emSize", &FontAtlas::emSize);
        }

        tspp::describe(ns->function("loadFont", &loadFont))
            .desc("Creates a font atlas from a TTF file")
            .param(0, "fontPath", "The path to the font file")
            .param(1, "device", "The logical device to use")
            .param(2, "cmdPool", "The command pool to use")
            .returns("A FontAtlas object that contains the font texture, glyphs, and other metadata");

        tspp::describe(ns->function("loadFontWithCharset", &loadFontWithCharset))
            .desc("Creates a font atlas from a TTF file with a custom charset")
            .param(0, "fontPath", "The path to the font file")
            .param(1, "codepoints", "The codepoints to load")
            .param(2, "device", "The logical device to use")
            .param(3, "cmdPool", "The command pool to use")
            .returns("A FontAtlas object that contains the font texture, glyphs, and other metadata");
    }
}