export class DepthManager {
    private m_maxTreeDepth: number;
    private m_minZIndex: number;
    private m_maxZIndex: number;
    private m_needsRecalculate: boolean;

    // z-index -> element count
    private m_zIndices: Map<number, number>;

    // z-index -> tree depth -> depth
    private m_depthCache: Map<number, Map<number, number>>;

    constructor() {
        this.m_maxTreeDepth = 0;
        this.m_minZIndex = 0;
        this.m_maxZIndex = 0;
        this.m_needsRecalculate = false;
        this.m_zIndices = new Map<number, number>();
        this.m_depthCache = new Map<number, Map<number, number>>();
    }

    get maxTreeDepth() {
        return this.m_maxTreeDepth;
    }

    set maxTreeDepth(value: number) {
        this.m_maxTreeDepth = value;
    }

    set currentTreeDepth(value: number) {
        if (value > this.m_maxTreeDepth) {
            this.m_maxTreeDepth = value;
        }
    }

    onZIndexAdded(zIndex: number) {
        const currentCount = this.m_zIndices.get(zIndex) ?? 0;
        this.m_zIndices.set(zIndex, currentCount + 1);

        if (currentCount === 0) {
            this.m_needsRecalculate = true;
        }
    }

    onZIndexRemoved(zIndex: number) {
        const currentCount = this.m_zIndices.get(zIndex) ?? 0;
        this.m_zIndices.set(zIndex, Math.max(currentCount - 1, 0));

        if (currentCount === 1) {
            this.m_needsRecalculate = true;
        }
    }

    onZIndexChanged(previous: number, current: number) {
        const prevCount = this.m_zIndices.get(previous) ?? 0;
        const currentCount = this.m_zIndices.get(current) ?? 0;
        this.m_zIndices.set(previous, Math.max(prevCount - 1, 0));
        this.m_zIndices.set(current, currentCount + 1);

        if (prevCount === 1 || currentCount === 0) {
            this.m_needsRecalculate = true;
        }
    }

    getDepthValue(zIndex: number, treeDepth: number) {
        if (this.m_needsRecalculate) {
            this.m_minZIndex = Infinity;
            this.m_maxZIndex = -Infinity;
            for (const [zIndex, count] of this.m_zIndices) {
                if (count <= 0) continue;
                this.m_minZIndex = Math.min(this.m_minZIndex, zIndex);
                this.m_maxZIndex = Math.max(this.m_maxZIndex, zIndex);
            }
            if (this.m_minZIndex === Infinity) this.m_minZIndex = 0;
            if (this.m_maxZIndex === -Infinity) this.m_maxZIndex = 0;
            this.m_needsRecalculate = false;

            this.m_depthCache.clear();
        }

        let treeDepthCache = this.m_depthCache.get(zIndex);
        if (treeDepthCache) {
            const depth = treeDepthCache.get(treeDepth);
            if (depth !== undefined) return depth;
        }

        // Use z-index as the primary factor, tree depth as tie-breaker

        const zIndexRange = this.m_maxZIndex - this.m_minZIndex;
        const treeDepthRange = this.m_maxTreeDepth;

        let depth: number;

        if (zIndexRange === 0) {
            // All elements have the same z-index, use only tree depth
            if (treeDepthRange === 0) {
                depth = 0.5; // Single element or all at same depth
            } else {
                depth = treeDepth / treeDepthRange;
            }
        } else {
            // Map z-index to most of the depth range (0.0 to ~0.99)
            // Reserve small portion for tree depth tie-breaking
            const zIndexNormalized = (zIndex - this.m_minZIndex) / zIndexRange;
            const zIndexDepth = zIndexNormalized * 0.7; // Use 70% of range for z-index

            // Use remaining 30% of range for tree depth tie-breaking within same z-index
            const treeDepthNormalized = treeDepthRange > 0 ? treeDepth / treeDepthRange : 0;
            const treeDepthOffset = treeDepthNormalized * 0.3; // Use 30% of range for tree depth

            depth = zIndexDepth + treeDepthOffset;
        }

        depth = 1.0 - Math.max(0, Math.min(1, depth));

        if (!treeDepthCache) {
            treeDepthCache = new Map<number, number>();
            this.m_depthCache.set(zIndex, treeDepthCache);
        }

        treeDepthCache.set(treeDepth, depth);

        return depth;
    }
}
