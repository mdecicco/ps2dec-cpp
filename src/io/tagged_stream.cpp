#include <decomp/io/tagged_stream.h>
#include <decomp/utils/array.hpp>
#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>

namespace decomp {
    namespace io {
        TaggedStream::TaggedStream() {
            m_ownsStream = false;
            m_stream     = nullptr;
            m_origin     = 0;
            m_blockCount = 0;
        }

        TaggedStream::~TaggedStream() {
            for (auto& tag : m_tags) {
                for (auto& block : tag.second->blocks) {
                    delete block;
                }

                delete tag.second;
            }

            if (m_ownsStream && m_stream) {
                delete (Buffer*)m_stream;
                m_stream = nullptr;
            }
        }

        TaggedStream* TaggedStream::open(IStream* stream) {
            u64 origin = stream->position();
            char magic[4];
            stream->read(magic, 4);
            if (memcmp(magic, "TSV1", 4) != 0) {
                throw FileException("TaggedStream::open() - Not a tagged stream");
            }

            TaggedStream* taggedStream = new TaggedStream();
            taggedStream->m_stream     = stream;
            taggedStream->m_origin     = origin;
            taggedStream->m_ownsStream = false;

            for (u32 i = 0; !stream->at_end(); i++) {
                taggedStream->m_blockCount++;
                Tag tag;
                stream->read(tag);
                if (!tag) {
                    break;
                }

                u32 size;
                stream->read(size);

                u64 blockOrigin  = stream->position();
                TagInfo* tagInfo = taggedStream->getTagInfo(tag, true);
                Block* block     = new Block(tag, blockOrigin - origin, size, i, stream);
                tagInfo->blocks.push(block);

                u64 nextPos = blockOrigin + size;
                if (nextPos == stream->size()) {
                    break;
                } else if (nextPos > stream->size()) {
                    throw FileException("TaggedStream::open() - Block size is greater than remaining stream size");
                }

                stream->seek(nextPos);
            }

            return taggedStream;
        }

        TaggedStream* TaggedStream::create() {
            IStream* stream            = new Buffer();
            TaggedStream* taggedStream = new TaggedStream();
            taggedStream->m_stream     = stream;
            taggedStream->m_ownsStream = true;

            return taggedStream;
        }

        void TaggedStream::close(TaggedStream* stream) {
            delete stream;
        }

        TaggedStream::Block* TaggedStream::addBlock(TaggedStream::Tag tag, Block* insertAfter) {
            u32 index = m_blockCount;
            if (insertAfter) {
                index = insertAfter->getIndex() + 1;

                for (auto& it : m_tags) {
                    for (auto& block : it.second->blocks) {
                        if (block->getIndex() >= index) {
                            block->m_index++;
                        }
                    }
                }
            }

            TagInfo* tagInfo = getTagInfo(tag, true);
            Block* block     = new Block(tag, index);
            tagInfo->blocks.push(block);
            m_blockCount++;

            return block;
        }

        void TaggedStream::removeBlock(Block* block) {
            TagInfo* tagInfo = getTagInfo(block->getTag());
            if (!tagInfo) {
                throw InputException("TaggedStream::removeBlock() - No blocks with tag %d found", block->getTag());
            }

            bool found = false;

            for (u32 i = 0; i < tagInfo->blocks.size(); i++) {
                if (tagInfo->blocks[i] == block) {
                    tagInfo->blocks.remove(i);
                    found = true;
                    break;
                }
            }

            if (!found) {
                throw InputException(
                    "TaggedStream::removeBlock() - Block 0x%08X with tag %d not found", (u64)block, block->getTag()
                );
            }

            m_blockCount--;
            delete block;
        }

        bool TaggedStream::hasTag(Tag tag) const {
            return m_tags.find(tag) != m_tags.end();
        }

        bool TaggedStream::getBlocksWithTag(Tag tag, Array<Block*>& blocks) const {
            auto it = m_tags.find(tag);
            if (it == m_tags.end()) {
                return false;
            }

            blocks = it->second->blocks;
            return true;
        }

        Array<TaggedStream::Block*> TaggedStream::getBlocksWithTag(Tag tag) const {
            auto it = m_tags.find(tag);
            if (it == m_tags.end()) {
                return Array<Block*>();
            }

            return it->second->blocks;
        }

        void TaggedStream::serialize(IStream* stream) const {
            stream->write("TSV1", 4);

            Array<Block*> allBlocks;
            for (auto& it : m_tags) {
                for (auto& block : it.second->blocks) {
                    allBlocks.push(block);
                }
            }

            allBlocks.sort([](Block* a, Block* b) { return a->getIndex() < b->getIndex(); });

            for (auto& block : allBlocks) {
                u64 prevPos = block->position();

                try {
                    stream->write(block->getTag());
                    stream->write(u32(block->size()));
                    block->seek(0);
                    stream->write(block);
                    block->seek(prevPos);
                } catch (const GenericException& e) {
                    block->seek(prevPos);
                    throw e;
                } catch (const std::exception& e) {
                    block->seek(prevPos);
                    throw e;
                }
            }

            stream->write<u16>(0);
        }

        TaggedStream::TagInfo* TaggedStream::getTagInfo(Tag tag, bool create) {
            auto it = m_tags.find(tag);
            if (it == m_tags.end()) {
                if (create) {
                    return m_tags[tag] = new TagInfo();
                }

                return nullptr;
            }

            return it->second;
        }
    }
}