#pragma once
#include <render/types.h>

namespace render {
    namespace utils {
        class AlignedAllocator {
            public:
                struct Node {
                    public:
                        u32 getRequestedSize() const;
                        u32 getActualSize() const;
                        u32 getOffset() const;

                    protected:
                        friend class AlignedAllocator;
                        u32 m_offset;
                        u32 m_size;
                        u32 m_requestedSize;
                        Node* m_next;
                        Node* m_prev;
                };

                AlignedAllocator();
                ~AlignedAllocator();

                void init(u32 alignment, u32 capacity, u32 maxAllocations, u32 minAllocationSize);
                void shutdown();

                u32 getLiveCount() const;
                u32 getLiveSize() const;
                u32 getFreeSize() const;
                u32 getCurrentMaximumBlockSize() const;

                Node* allocate(u32 size);
                void free(Node* node);

                static u32 align(u32 value, u32 alignment);

            private:
                void unlinkNode(Node* node);
                void insert(Node* n, Node** list);
                void insertAfter(Node* n, Node* after);
                Node* getUnusedNode();

                Node* m_free;
                Node* m_live;
                Node* m_unused;
                Node* m_nodes;
                u32 m_alignment;
                u32 m_maxAllocations;
                u32 m_capacity;
                u32 m_minAllocationSize;
                u32 m_currentMaximumBlockSize;
                u32 m_liveCount;
                u32 m_liveSize;
                u32 m_freeSize;
        };
    };
};