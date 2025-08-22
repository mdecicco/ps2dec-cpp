#pragma once
#include <decomp/types.h>
#include <decomp/utils/stream.hpp>
#include <utils/Array.h>

#include <unordered_map>

namespace decomp {
    class Buffer;

    namespace io {
        class File;

        class TaggedStream {
            public:
                typedef u16 Tag;

                class Block : public IStream {
                    public:
                        Tag getTag() const;
                        u32 getIndex() const;
                        u64 getOffset() const;
                        bool hasChanges() const;

                        void seek(u64 offsetInBytes) override;
                        u64 position() const override;
                        u64 size() const override;
                        void readBytes(void* buffer, u64 size) override;
                        void writeBytes(const void* buffer, u64 size) override;

                    protected:
                        friend class TaggedStream;
                        Block(Tag tag, u64 offset, u64 size, u32 index, IStream* stream);
                        Block(Tag tag, u32 index);
                        ~Block();

                    private:
                        Tag m_tag;
                        u32 m_index;
                        u64 m_offset;
                        u64 m_size;
                        u64 m_position;
                        IStream* m_stream;
                        Buffer* m_updateBuffer;
                };

                static TaggedStream* open(IStream* stream);
                static TaggedStream* create();
                static void close(TaggedStream* stream);

                Block* addBlock(Tag tag, Block* insertAfter = nullptr);
                void removeBlock(Block* block);
                bool hasTag(Tag tag) const;
                bool getBlocksWithTag(Tag tag, Array<Block*>& blocks) const;
                Array<Block*> getBlocksWithTag(Tag tag) const;
                void serialize(IStream* stream) const;

            private:
                struct TagInfo {
                    public:
                        Array<Block*> blocks;
                };

                TaggedStream();
                ~TaggedStream();

                TagInfo* getTagInfo(Tag tag, bool create = false);

                bool m_ownsStream;
                IStream* m_stream;
                u64 m_origin;
                u32 m_blockCount;
                std::unordered_map<Tag, TagInfo*> m_tags;
        };
    }
}