#include <render/utils/AlignedAllocator.h>
#include <utils/Exception.h>

namespace render {
    namespace utils {
        u32 AlignedAllocator::Node::getRequestedSize() const {
            return m_requestedSize;
        }

        u32 AlignedAllocator::Node::getActualSize() const {
            return m_size;
        }

        u32 AlignedAllocator::Node::getOffset() const {
            return m_offset;
        }

        AlignedAllocator::AlignedAllocator() {
            m_alignment               = 0;
            m_capacity                = 0;
            m_maxAllocations          = 0;
            m_minAllocationSize       = 0;
            m_currentMaximumBlockSize = 0;
            m_liveCount               = 0;
            m_liveSize                = 0;
            m_freeSize                = 0;
            m_free = m_live = m_unused = m_nodes = nullptr;
        }

        AlignedAllocator::~AlignedAllocator() {
            shutdown();
        }

        void AlignedAllocator::init(u32 alignment, u32 capacity, u32 maxAllocations, u32 minAllocationSize) {
            if (m_nodes) {
                throw ::utils::InvalidActionException("AlignedAllocator already initialized");
            }

            if (capacity != AlignedAllocator::align(capacity, alignment)) {
                throw ::utils::InvalidArgumentException("Capacity must be aligned to the specified alignment");
            }

            m_alignment               = alignment;
            m_capacity                = capacity;
            m_maxAllocations          = maxAllocations;
            m_minAllocationSize       = AlignedAllocator::align(minAllocationSize, alignment);
            m_currentMaximumBlockSize = 0;

            m_nodes = new Node[m_maxAllocations];

            for (u32 i = 0; i < m_maxAllocations; i++) {
                m_nodes[i].m_offset = 0;
                m_nodes[i].m_size   = 0;
                m_nodes[i].m_next   = i < m_maxAllocations - 1 ? &m_nodes[i + 1] : nullptr;
                m_nodes[i].m_prev   = i > 0 ? &m_nodes[i - 1] : nullptr;
            }

            m_unused = &m_nodes[0];
            m_live   = nullptr;

            Node* n     = getUnusedNode();
            n->m_offset = 0;
            n->m_size   = capacity;
            m_free      = n;
        }

        void AlignedAllocator::shutdown() {
            if (!m_nodes) {
                return;
            }

            delete[] m_nodes;
            m_free = m_live = m_nodes = nullptr;

            m_alignment               = 0;
            m_capacity                = 0;
            m_maxAllocations          = 0;
            m_minAllocationSize       = 0;
            m_currentMaximumBlockSize = 0;
            m_liveCount               = 0;
            m_liveSize                = 0;
            m_freeSize                = 0;
        }

        u32 AlignedAllocator::getLiveCount() const {
            return m_liveCount;
        }

        u32 AlignedAllocator::getLiveSize() const {
            return m_liveSize;
        }

        u32 AlignedAllocator::getFreeSize() const {
            return m_freeSize;
        }

        u32 AlignedAllocator::getCurrentMaximumBlockSize() const {
            return m_currentMaximumBlockSize;
        }

        AlignedAllocator::Node* AlignedAllocator::allocate(u32 size) {
            u32 requestedSize = size;

            size = AlignedAllocator::align(size, m_alignment);
            if (size < m_minAllocationSize) {
                size = m_minAllocationSize;
            }

            Node* n = m_free;
            while (n) {
                if (n->m_size >= size) {
                    break;
                }

                n = n->m_next;
            }

            if (!n) {
                return nullptr;
            }

            u32 originalSize  = n->m_size;
            u32 remainingSize = n->m_size - size;
            if (remainingSize >= m_minAllocationSize && m_unused) {
                // Node can be split, the remaining size may be
                // used for other allocations
                Node* result     = getUnusedNode();
                result->m_offset = n->m_offset;
                result->m_size   = size;

                n->m_offset = n->m_offset + size;
                n->m_size   = remainingSize;

                n = result;
            } else {
                unlinkNode(n);
            }

            insert(n, &m_live);

            if (originalSize >= m_currentMaximumBlockSize) {
                // recalculate the maximum block size
                m_currentMaximumBlockSize = 0;

                Node* i = m_free;
                while (i) {
                    if (i->m_size > m_currentMaximumBlockSize) {
                        m_currentMaximumBlockSize = i->m_size;
                    }

                    i = i->m_next;
                }
            }

            m_liveCount++;
            m_liveSize += n->m_size;
            m_freeSize -= n->m_size;

            n->m_requestedSize = requestedSize;
            return n;
        }

        void AlignedAllocator::free(Node* allocation) {
            if (!allocation) {
                return;
            }

            Node* n = allocation;
            unlinkNode(n);

            m_freeSize += n->m_size;
            m_liveCount--;
            m_liveSize -= n->m_size;

            if (!m_free) {
                m_free = n;
                return;
            }

            Node* i = m_free;
            while (i) {
                if (i->m_offset + i->m_size > n->m_offset) {
                    // this node, and all that follow are after node n. n should be first
                    insert(n, &m_free);
                    break;
                }

                if (!i->m_next || i->m_next->m_offset >= n->m_offset + n->m_size) {
                    // the next node comes after n, or n should be the last node
                    insertAfter(n, i);
                    break;
                }

                i = i->m_next;
            }

            if (n->m_prev && n->m_prev->m_offset + n->m_prev->m_size == n->m_offset) {
                // previous node ends at start of current node
                Node* prev = n->m_prev;
                prev->m_size += n->m_size;

                unlinkNode(n);
                insert(n, &m_unused);

                n = prev;
            }

            if (n->m_next && n->m_offset + n->m_size == n->m_next->m_offset) {
                // next node starts at the end of current node
                Node* next = n->m_next;
                n->m_size += next->m_size;

                unlinkNode(next);
                insert(next, &m_unused);
            }

            if (n->m_size > m_currentMaximumBlockSize) {
                m_currentMaximumBlockSize = n->m_size;
            }
        }

        u32 AlignedAllocator::align(u32 value, u32 alignment) {
            u32 r = value % alignment;
            return r ? value + (alignment - r) : value;
        }

        void AlignedAllocator::unlinkNode(Node* node) {
            if (node->m_next) {
                node->m_next->m_prev = node->m_prev;
            }

            if (node->m_prev) {
                node->m_prev->m_next = node->m_next;
            }

            if (node == m_live) {
                m_live = node->m_next;
            } else if (node == m_free) {
                m_free = node->m_next;
            } else if (node == m_unused) {
                m_unused = node->m_next;
            }

            node->m_prev          = nullptr;
            node->m_next          = nullptr;
            node->m_requestedSize = 0;
        }

        void AlignedAllocator::insert(Node* n, Node** list) {
            if (!list) {
                return;
            }

            n->m_next = *list;
            n->m_prev = nullptr;

            if (*list) {
                (*list)->m_prev = n;
            }

            *list = n;
        }

        void AlignedAllocator::insertAfter(Node* n, Node* after) {
            if (!after) {
                return;
            }

            n->m_next     = after->m_next;
            n->m_prev     = after;
            after->m_next = n;
            if (n->m_next) {
                n->m_next->m_prev = n;
            }
        }

        AlignedAllocator::Node* AlignedAllocator::getUnusedNode() {
            if (!m_unused) {
                return nullptr;
            }

            Node* n  = m_unused;
            m_unused = n->m_next;

            if (m_unused) {
                m_unused->m_prev = nullptr;
            }

            n->m_next          = nullptr;
            n->m_prev          = nullptr;
            n->m_offset        = 0;
            n->m_size          = 0;
            n->m_requestedSize = 0;

            return n;
        }
    }
}