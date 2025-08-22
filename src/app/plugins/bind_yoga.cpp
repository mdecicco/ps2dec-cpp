#include <decomp/app/application.h>
#include <decomp/utils/math.hpp>

#include <bind/Namespace.hpp>
#include <bind/Registry.hpp>

#include <tspp/utils/Callback.h>
#include <tspp/utils/Docs.h>

#include <yoga/Yoga.h>

namespace decomp {
    typedef vec2f (*MeasureFunc)(f32 width, YGMeasureMode widthMode, f32 height, YGMeasureMode heightMode);

    YGSize measureFunc(
        YGNodeConstRef self, float width, YGMeasureMode widthMode, float height, YGMeasureMode heightMode
    ) {
        MeasureFunc func = (MeasureFunc)YGNodeGetContext(self);
        if (!func) {
            return YGSize{0, 0};
        }

        vec2f size = func(width, widthMode, height, heightMode);

        return YGSize{size.x, size.y};
    }

    void bindEnums(bind::Namespace* ns) {
        {
            bind::EnumTypeBuilder<YGAlign> b = ns->type<YGAlign>("YGAlign");
            b.addEnumValue("YGAlignAuto", YGAlignAuto);
            b.addEnumValue("YGAlignFlexStart", YGAlignFlexStart);
            b.addEnumValue("YGAlignCenter", YGAlignCenter);
            b.addEnumValue("YGAlignFlexEnd", YGAlignFlexEnd);
            b.addEnumValue("YGAlignStretch", YGAlignStretch);
            b.addEnumValue("YGAlignBaseline", YGAlignBaseline);
            b.addEnumValue("YGAlignSpaceBetween", YGAlignSpaceBetween);
            b.addEnumValue("YGAlignSpaceAround", YGAlignSpaceAround);
            b.addEnumValue("YGAlignSpaceEvenly", YGAlignSpaceEvenly);
        }

        {
            bind::EnumTypeBuilder<YGBoxSizing> b = ns->type<YGBoxSizing>("YGBoxSizing");
            b.addEnumValue("YGBoxSizingBorderBox", YGBoxSizingBorderBox);
            b.addEnumValue("YGBoxSizingContentBox", YGBoxSizingContentBox);
        }

        {
            bind::EnumTypeBuilder<YGDimension> b = ns->type<YGDimension>("YGDimension");
            b.addEnumValue("YGDimensionWidth", YGDimensionWidth);
            b.addEnumValue("YGDimensionHeight", YGDimensionHeight);
        }

        {
            bind::EnumTypeBuilder<YGDirection> b = ns->type<YGDirection>("YGDirection");
            b.addEnumValue("YGDirectionInherit", YGDirectionInherit);
            b.addEnumValue("YGDirectionLTR", YGDirectionLTR);
            b.addEnumValue("YGDirectionRTL", YGDirectionRTL);
        }

        {
            bind::EnumTypeBuilder<YGDisplay> b = ns->type<YGDisplay>("YGDisplay");
            b.addEnumValue("YGDisplayFlex", YGDisplayFlex);
            b.addEnumValue("YGDisplayNone", YGDisplayNone);
            b.addEnumValue("YGDisplayContents", YGDisplayContents);
        }

        {
            bind::EnumTypeBuilder<YGEdge> b = ns->type<YGEdge>("YGEdge");
            b.addEnumValue("YGEdgeLeft", YGEdgeLeft);
            b.addEnumValue("YGEdgeTop", YGEdgeTop);
            b.addEnumValue("YGEdgeRight", YGEdgeRight);
            b.addEnumValue("YGEdgeBottom", YGEdgeBottom);
            b.addEnumValue("YGEdgeStart", YGEdgeStart);
            b.addEnumValue("YGEdgeEnd", YGEdgeEnd);
            b.addEnumValue("YGEdgeHorizontal", YGEdgeHorizontal);
            b.addEnumValue("YGEdgeVertical", YGEdgeVertical);
            b.addEnumValue("YGEdgeAll", YGEdgeAll);
        }

        {
            bind::EnumTypeBuilder<YGErrata> b = ns->type<YGErrata>("YGErrata");
            b.addEnumValue("YGErrataNone", YGErrataNone);
            b.addEnumValue("YGErrataStretchFlexBasis", YGErrataStretchFlexBasis);
            b.addEnumValue(
                "YGErrataAbsolutePositionWithoutInsetsExcludesPadding",
                YGErrataAbsolutePositionWithoutInsetsExcludesPadding
            );
            b.addEnumValue("YGErrataAbsolutePercentAgainstInnerSize", YGErrataAbsolutePercentAgainstInnerSize);
            b.addEnumValue("YGErrataAll", YGErrataAll);
            b.addEnumValue("YGErrataClassic", YGErrataClassic);
        }

        {
            bind::EnumTypeBuilder<YGExperimentalFeature> b = ns->type<YGExperimentalFeature>("YGExperimentalFeature");
            b.addEnumValue("YGExperimentalFeatureWebFlexBasis", YGExperimentalFeatureWebFlexBasis);
        }

        {
            bind::EnumTypeBuilder<YGFlexDirection> b = ns->type<YGFlexDirection>("YGFlexDirection");
            b.addEnumValue("YGFlexDirectionColumn", YGFlexDirectionColumn);
            b.addEnumValue("YGFlexDirectionColumnReverse", YGFlexDirectionColumnReverse);
            b.addEnumValue("YGFlexDirectionRow", YGFlexDirectionRow);
            b.addEnumValue("YGFlexDirectionRowReverse", YGFlexDirectionRowReverse);
        }

        {
            bind::EnumTypeBuilder<YGGutter> b = ns->type<YGGutter>("YGGutter");
            b.addEnumValue("YGGutterColumn", YGGutterColumn);
            b.addEnumValue("YGGutterRow", YGGutterRow);
            b.addEnumValue("YGGutterAll", YGGutterAll);
        }

        {
            bind::EnumTypeBuilder<YGJustify> b = ns->type<YGJustify>("YGJustify");
            b.addEnumValue("YGJustifyFlexStart", YGJustifyFlexStart);
            b.addEnumValue("YGJustifyCenter", YGJustifyCenter);
            b.addEnumValue("YGJustifyFlexEnd", YGJustifyFlexEnd);
            b.addEnumValue("YGJustifySpaceBetween", YGJustifySpaceBetween);
            b.addEnumValue("YGJustifySpaceAround", YGJustifySpaceAround);
            b.addEnumValue("YGJustifySpaceEvenly", YGJustifySpaceEvenly);
        }

        {
            bind::EnumTypeBuilder<YGLogLevel> b = ns->type<YGLogLevel>("YGLogLevel");
            b.addEnumValue("YGLogLevelError", YGLogLevelError);
            b.addEnumValue("YGLogLevelWarn", YGLogLevelWarn);
            b.addEnumValue("YGLogLevelInfo", YGLogLevelInfo);
            b.addEnumValue("YGLogLevelDebug", YGLogLevelDebug);
            b.addEnumValue("YGLogLevelVerbose", YGLogLevelVerbose);
        }

        {
            bind::EnumTypeBuilder<YGMeasureMode> b = ns->type<YGMeasureMode>("YGMeasureMode");
            b.addEnumValue("YGMeasureModeUndefined", YGMeasureModeUndefined);
            b.addEnumValue("YGMeasureModeExactly", YGMeasureModeExactly);
            b.addEnumValue("YGMeasureModeAtMost", YGMeasureModeAtMost);
        }

        {
            bind::EnumTypeBuilder<YGNodeType> b = ns->type<YGNodeType>("YGNodeType");
            b.addEnumValue("YGNodeTypeDefault", YGNodeTypeDefault);
            b.addEnumValue("YGNodeTypeText", YGNodeTypeText);
        }

        {
            bind::EnumTypeBuilder<YGOverflow> b = ns->type<YGOverflow>("YGOverflow");
            b.addEnumValue("YGOverflowVisible", YGOverflowVisible);
            b.addEnumValue("YGOverflowHidden", YGOverflowHidden);
            b.addEnumValue("YGOverflowScroll", YGOverflowScroll);
        }

        {
            bind::EnumTypeBuilder<YGPositionType> b = ns->type<YGPositionType>("YGPositionType");
            b.addEnumValue("YGPositionTypeStatic", YGPositionTypeStatic);
            b.addEnumValue("YGPositionTypeRelative", YGPositionTypeRelative);
            b.addEnumValue("YGPositionTypeAbsolute", YGPositionTypeAbsolute);
        }

        {
            bind::EnumTypeBuilder<YGUnit> b = ns->type<YGUnit>("YGUnit");
            b.addEnumValue("YGUnitUndefined", YGUnitUndefined);
            b.addEnumValue("YGUnitPoint", YGUnitPoint);
            b.addEnumValue("YGUnitPercent", YGUnitPercent);
            b.addEnumValue("YGUnitAuto", YGUnitAuto);
        }

        {
            bind::EnumTypeBuilder<YGWrap> b = ns->type<YGWrap>("YGWrap");
            b.addEnumValue("YGWrapNoWrap", YGWrapNoWrap);
            b.addEnumValue("YGWrapWrap", YGWrapWrap);
            b.addEnumValue("YGWrapWrapReverse", YGWrapWrapReverse);
        }
    }

    void bindConfig(bind::Namespace* ns) {
        tspp::describe(ns->function("YGConfigNew", &YGConfigNew))
            .desc(
                "Allocates a set of configuration options. The configuration may be applied to multiple nodes (i.e. a "
                "single global config), or can be applied more granularly per-node."
            );
        tspp::describe(ns->function("YGConfigFree", &YGConfigFree)).desc("Frees the associated Yoga configuration.");
        tspp::describe(ns->function("YGConfigGetDefault", &YGConfigGetDefault))
            .desc("Returns the default config values set by Yoga.");
        tspp::describe(ns->function("YGConfigSetUseWebDefaults", &YGConfigSetUseWebDefaults))
            .desc(
                "Yoga by default creates new nodes with style defaults different from flexbox on web (e.g. "
                "`YGFlexDirectionColumn` and `YGPositionRelative`). `UseWebDefaults` instructs Yoga to instead use a "
                "default style consistent with the web."
            );
        tspp::describe(ns->function("YGConfigGetUseWebDefaults", &YGConfigGetUseWebDefaults))
            .desc("Whether the configuration is set to use web defaults.");
        tspp::describe(ns->function("YGConfigSetPointScaleFactor", &YGConfigSetPointScaleFactor))
            .desc(
                "Yoga will by default round final layout positions and dimensions to the nearst point. "
                "`pointScaleFactor` controls the density of the grid used for layout rounding (e.g. to round to the "
                "closest display pixel). May be set to 0.0f to avoid rounding the layout results."
            );
        tspp::describe(ns->function("YGConfigGetPointScaleFactor", &YGConfigGetPointScaleFactor))
            .desc("Get the currently set point scale factor.");
        tspp::describe(ns->function("YGConfigSetErrata", &YGConfigSetErrata))
            .desc(
                "Configures how Yoga balances W3C conformance vs compatibility with layouts created against earlier "
                "versions of Yoga. By default Yoga will prioritize W3C conformance. `Errata` may be set to ask Yoga to "
                "produce specific incorrect behaviors. E.g. `YGConfigSetErrata(config, YGErrataStretchFlexBasis)`.\n\n"
                "YGErrata is a bitmask, and multiple errata may be set at once. Predefined constants exist for "
                "convenience:\n"
                "1. YGErrataNone: No errata\n"
                "2. YGErrataClassic: Match layout behaviors of Yoga 1.x\n"
                "3. YGErrataAll: Match layout behaviors of Yoga 1.x, including `UseLegacyStretchBehaviour`"
            );
        tspp::describe(ns->function("YGConfigGetErrata", &YGConfigGetErrata)).desc("Get the currently set errata.");
        tspp::describe(ns->function("YGConfigSetExperimentalFeatureEnabled", &YGConfigSetExperimentalFeatureEnabled))
            .desc("Enable an experimental/unsupported feature in Yoga.");
        tspp::describe(ns->function("YGConfigIsExperimentalFeatureEnabled", &YGConfigIsExperimentalFeatureEnabled))
            .desc("Whether an experimental feature is set.");
    }

    void bindNode(bind::Namespace* ns) {
        auto SetMeasureFunc = +[](YGNodeRef self, MeasureFunc func) {
            MeasureFunc prevFunc = (MeasureFunc)YGNodeGetContext(self);
            if (prevFunc) {
                tspp::Callback::Release(prevFunc);
            }

            if (!func) {
                YGNodeSetMeasureFunc(self, nullptr);
                YGNodeSetContext(self, nullptr);
                return;
            }

            YGNodeSetContext(self, (void*)func);
            YGNodeSetMeasureFunc(self, measureFunc);
            tspp::Callback::AddRef(func);
        };

        tspp::describe(bind::Registry::GetType<MeasureFunc>())
            .desc(
                "(width: f32, widthMode: YGMeasureMode, height: f32, heightMode: YGMeasureMode) => YGSize;\n\n"
                "Returns the computed dimensions of the node, following the constraints of `widthMode` and "
                "`heightMode`.\n\n"
                "YGMeasureModeUndefined: The parent has not imposed any constraint on the child. It can be whatever "
                "size it wants.\n"
                "YGMeasureModeAtMost: The child can be as large as it wants up to the specified size.\n"
                "YGMeasureModeExactly: The parent has determined an exact size for the child. The child is going to be "
                "given those bounds regardless of how big it wants to be."
            );

        tspp::describe(ns->function("YGNodeNew", &YGNodeNew))
            .desc("Heap allocates and returns a new Yoga node using Yoga settings.");
        tspp::describe(ns->function("YGNodeNewWithConfig", &YGNodeNewWithConfig))
            .desc("Heap allocates and returns a new Yoga node, with customized settings.");
        tspp::describe(ns->function("YGNodeClone", &YGNodeClone))
            .desc(
                "Returns a mutable copy of an existing node, with the same context and children, but no owner set. "
                "Does not call the function set by YGConfigSetCloneNodeFunc()."
            );
        tspp::describe(ns->function("YGNodeFree", &YGNodeFree))
            .desc("Frees the Yoga node, disconnecting it from its owner and children.");
        tspp::describe(ns->function("YGNodeFreeRecursive", &YGNodeFreeRecursive))
            .desc("Frees the subtree of Yoga nodes rooted at the given node.");
        tspp::describe(ns->function("YGNodeFinalize", &YGNodeFinalize))
            .desc(
                "Frees the Yoga node without disconnecting it from its owner or children. Allows garbage collecting "
                "Yoga nodes in parallel when the entire tree is unreachable."
            );
        tspp::describe(ns->function("YGNodeReset", &YGNodeReset)).desc("Resets the node to its default state.");
        tspp::describe(ns->function("YGNodeCalculateLayout", &YGNodeCalculateLayout))
            .desc(
                "Calculates the layout of the tree rooted at the given node.\n\n"
                "Layout results may be read after calling `YGNodeCalculateLayout()` using functions like "
                "`YGNodeLayoutGetLeft()`, `YGNodeLayoutGetTop()`, etc.\n\n"
                "`YGNodeGetHasNewLayout()` may be read to know if the layout of the node or its subtrees may have "
                "changed since the last time `YGNodeCalculateLayout()` was called."
            );
        tspp::describe(ns->function("YGNodeGetHasNewLayout", &YGNodeGetHasNewLayout))
            .desc(
                "Whether the given node may have new layout results. Must be reset by calling "
                "`YGNodeSetHasNewLayout()`."
            );
        tspp::describe(ns->function("YGNodeSetHasNewLayout", &YGNodeSetHasNewLayout))
            .desc("Sets whether a nodes layout is considered new.");
        tspp::describe(ns->function("YGNodeIsDirty", &YGNodeIsDirty))
            .desc("Whether the node's layout results are dirty due to it or its children changing.");
        tspp::describe(ns->function("YGNodeMarkDirty", &YGNodeMarkDirty))
            .desc("Marks a node with custom measure function as dirty.");
        tspp::describe(ns->function("YGNodeInsertChild", &YGNodeInsertChild))
            .desc("Inserts a child node at the given index.");
        tspp::describe(ns->function("YGNodeSwapChild", &YGNodeSwapChild))
            .desc("Replaces the child node at a given index with a new one.");
        tspp::describe(ns->function("YGNodeRemoveChild", &YGNodeRemoveChild)).desc("Removes the given child node.");
        tspp::describe(ns->function("YGNodeRemoveAllChildren", &YGNodeRemoveAllChildren))
            .desc("Removes all children nodes.");
        tspp::describe(ns->function(
                           "YGNodeSetChildren",
                           +[](YGNodeRef owner, const Array<YGNodeRef>& children) {
                               YGNodeSetChildren(owner, children.data(), children.size());
                           }
                       )
        ).desc("Sets children according to the given list of nodes.");
        tspp::describe(ns->function("YGNodeGetChild", &YGNodeGetChild)).desc("Get the child node at a given index.");
        tspp::describe(ns->function("YGNodeGetChildCount", &YGNodeGetChildCount)).desc("The number of child nodes.");
        tspp::describe(ns->function("YGNodeGetOwner", &YGNodeGetOwner))
            .desc("Get the parent/owner currently set for a node.");
        tspp::describe(ns->function("YGNodeGetParent", &YGNodeGetParent))
            .desc("Get the parent/owner currently set for a node.");
        tspp::describe(ns->function("YGNodeSetConfig", &YGNodeSetConfig))
            .desc("Set a new config for the node after creation.");
        tspp::describe(ns->function("YGNodeGetConfig", &YGNodeGetConfig))
            .desc("Get the config currently set on the node.");
        tspp::describe(ns->function("YGNodeSetMeasureFunc", SetMeasureFunc))
            .desc(
                "Allows providing custom measurements for a Yoga leaf node (usually for measuring text). "
                "YGNodeMarkDirty() must be set if content effecting the measurements of the node changes."
            )
            .param(0, "node", "The node to set the measure function on.")
            .param(1, "func", "The measure function to set.", true);
        tspp::describe(ns->function("YGNodeSetIsReferenceBaseline", &YGNodeSetIsReferenceBaseline))
            .desc("Sets whether this node should be considered the reference baseline among siblings.");
        tspp::describe(ns->function("YGNodeIsReferenceBaseline", &YGNodeIsReferenceBaseline))
            .desc("Whether this node is set as the reference baseline.");
        tspp::describe(ns->function("YGNodeSetNodeType", &YGNodeSetNodeType))
            .desc("Sets whether a leaf node's layout results may be truncated during layout rounding.");
        tspp::describe(ns->function("YGNodeGetNodeType", &YGNodeGetNodeType))
            .desc("Wwhether a leaf node's layout results may be truncated during layout rounding.");
        tspp::describe(ns->function("YGNodeSetAlwaysFormsContainingBlock", &YGNodeSetAlwaysFormsContainingBlock))
            .desc(
                "Make it so that this node will always form a containing block for any descendant nodes. This is "
                "useful for when a node has a property outside of of Yoga that will form a containing block. For "
                "example, transforms or some of the others listed in "
                "https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block"
            );
        tspp::describe(ns->function("YGNodeGetAlwaysFormsContainingBlock", &YGNodeGetAlwaysFormsContainingBlock))
            .desc(
                "Whether the node will always form a containing block for any descendant. This can happen in "
                "situation where the client implements something like a transform that can affect containing blocks "
                "but is not handled by Yoga directly."
            );
    }

    void bindNodeLayout(bind::Namespace* ns) {
        ns->function("YGNodeLayoutGetLeft", &YGNodeLayoutGetLeft);
        ns->function("YGNodeLayoutGetTop", &YGNodeLayoutGetTop);
        ns->function("YGNodeLayoutGetRight", &YGNodeLayoutGetRight);
        ns->function("YGNodeLayoutGetBottom", &YGNodeLayoutGetBottom);
        ns->function("YGNodeLayoutGetWidth", &YGNodeLayoutGetWidth);
        ns->function("YGNodeLayoutGetHeight", &YGNodeLayoutGetHeight);
        ns->function("YGNodeLayoutGetDirection", &YGNodeLayoutGetDirection);
        ns->function("YGNodeLayoutGetHadOverflow", &YGNodeLayoutGetHadOverflow);
        ns->function("YGNodeLayoutGetMargin", &YGNodeLayoutGetMargin);
        ns->function("YGNodeLayoutGetBorder", &YGNodeLayoutGetBorder);
        ns->function("YGNodeLayoutGetPadding", &YGNodeLayoutGetPadding);
    }

    void bindNodeStyle(bind::Namespace* ns) {
        tspp::describe(ns->function("YGNodeCopyStyle", &YGNodeCopyStyle))
            .param(0, "dstNode", "The node to copy the style to.")
            .param(1, "srcNode", "The node to copy the style from.");
        tspp::describe(ns->function("YGNodeStyleSetDirection", &YGNodeStyleSetDirection))
            .param(0, "node", "The node to set the direction on.")
            .param(1, "direction", "The direction to set.");
        tspp::describe(ns->function("YGNodeStyleGetDirection", &YGNodeStyleGetDirection))
            .param(0, "node", "The node to get the direction from.");
        tspp::describe(ns->function("YGNodeStyleSetFlexDirection", &YGNodeStyleSetFlexDirection))
            .param(0, "node", "The node to set the flex direction on.")
            .param(1, "flexDirection", "The flex direction to set.");
        tspp::describe(ns->function("YGNodeStyleGetFlexDirection", &YGNodeStyleGetFlexDirection))
            .param(0, "node", "The node to get the flex direction from.");
        tspp::describe(ns->function("YGNodeStyleSetJustifyContent", &YGNodeStyleSetJustifyContent))
            .param(0, "node", "The node to set the justify content on.")
            .param(1, "justifyContent", "The justify content to set.");
        tspp::describe(ns->function("YGNodeStyleGetJustifyContent", &YGNodeStyleGetJustifyContent))
            .param(0, "node", "The node to get the justify content from.");
        tspp::describe(ns->function("YGNodeStyleSetAlignContent", &YGNodeStyleSetAlignContent))
            .param(0, "node", "The node to set the align content on.")
            .param(1, "alignContent", "The align content to set.");
        tspp::describe(ns->function("YGNodeStyleGetAlignContent", &YGNodeStyleGetAlignContent))
            .param(0, "node", "The node to get the align content from.");
        tspp::describe(ns->function("YGNodeStyleSetAlignItems", &YGNodeStyleSetAlignItems))
            .param(0, "node", "The node to set the align items on.")
            .param(1, "alignItems", "The align items to set.");
        tspp::describe(ns->function("YGNodeStyleGetAlignItems", &YGNodeStyleGetAlignItems))
            .param(0, "node", "The node to get the align items from.");
        tspp::describe(ns->function("YGNodeStyleSetAlignSelf", &YGNodeStyleSetAlignSelf))
            .param(0, "node", "The node to set the align self on.")
            .param(1, "alignSelf", "The align self to set.");
        tspp::describe(ns->function("YGNodeStyleGetAlignSelf", &YGNodeStyleGetAlignSelf))
            .param(0, "node", "The node to get the align self from.");
        tspp::describe(ns->function("YGNodeStyleSetPositionType", &YGNodeStyleSetPositionType))
            .param(0, "node", "The node to set the position type on.")
            .param(1, "positionType", "The position type to set.");
        tspp::describe(ns->function("YGNodeStyleGetPositionType", &YGNodeStyleGetPositionType))
            .param(0, "node", "The node to get the position type from.");
        tspp::describe(ns->function("YGNodeStyleSetFlexWrap", &YGNodeStyleSetFlexWrap))
            .param(0, "node", "The node to set the flex wrap on.")
            .param(1, "flexWrap", "The flex wrap to set.");
        tspp::describe(ns->function("YGNodeStyleGetFlexWrap", &YGNodeStyleGetFlexWrap))
            .param(0, "node", "The node to get the flex wrap from.");
        tspp::describe(ns->function("YGNodeStyleSetOverflow", &YGNodeStyleSetOverflow))
            .param(0, "node", "The node to set the overflow on.")
            .param(1, "overflow", "The overflow to set.");
        tspp::describe(ns->function("YGNodeStyleGetOverflow", &YGNodeStyleGetOverflow))
            .param(0, "node", "The node to get the overflow from.");
        tspp::describe(ns->function("YGNodeStyleSetDisplay", &YGNodeStyleSetDisplay))
            .param(0, "node", "The node to set the display on.")
            .param(1, "display", "The display to set.");
        tspp::describe(ns->function("YGNodeStyleGetDisplay", &YGNodeStyleGetDisplay))
            .param(0, "node", "The node to get the display from.");
        tspp::describe(ns->function("YGNodeStyleSetFlex", &YGNodeStyleSetFlex))
            .param(0, "node", "The node to set the flex on.")
            .param(1, "flex", "The flex to set.");
        tspp::describe(ns->function("YGNodeStyleGetFlex", &YGNodeStyleGetFlex))
            .param(0, "node", "The node to get the flex from.");
        tspp::describe(ns->function("YGNodeStyleSetFlexGrow", &YGNodeStyleSetFlexGrow))
            .param(0, "node", "The node to set the flex grow on.")
            .param(1, "flexGrow", "The flex grow to set.");
        tspp::describe(ns->function("YGNodeStyleGetFlexGrow", &YGNodeStyleGetFlexGrow))
            .param(0, "node", "The node to get the flex grow from.");
        tspp::describe(ns->function("YGNodeStyleSetFlexShrink", &YGNodeStyleSetFlexShrink))
            .param(0, "node", "The node to set the flex shrink on.")
            .param(1, "flexShrink", "The flex shrink to set.");
        tspp::describe(ns->function("YGNodeStyleGetFlexShrink", &YGNodeStyleGetFlexShrink))
            .param(0, "node", "The node to get the flex shrink from.");
        tspp::describe(ns->function("YGNodeStyleSetFlexBasis", &YGNodeStyleSetFlexBasis))
            .param(0, "node", "The node to set the flex basis on.")
            .param(1, "flexBasis", "The flex basis to set.");
        tspp::describe(ns->function("YGNodeStyleSetFlexBasisPercent", &YGNodeStyleSetFlexBasisPercent))
            .param(0, "node", "The node to set the flex basis percent on.")
            .param(1, "flexBasis", "The flex basis percent to set.");
        tspp::describe(ns->function("YGNodeStyleSetFlexBasisAuto", &YGNodeStyleSetFlexBasisAuto))
            .param(0, "node", "The node to set the flex basis auto on.");
        tspp::describe(ns->function("YGNodeStyleGetFlexBasis", &YGNodeStyleGetFlexBasis))
            .param(0, "node", "The node to get the flex basis from.");
        tspp::describe(ns->function("YGNodeStyleSetPosition", &YGNodeStyleSetPosition))
            .param(0, "node", "The node to set the position on.")
            .param(1, "edge", "The edge to set.")
            .param(2, "position", "The position to set.");
        tspp::describe(ns->function("YGNodeStyleSetPositionPercent", &YGNodeStyleSetPositionPercent))
            .param(0, "node", "The node to set the position percent on.")
            .param(1, "edge", "The edge to set.")
            .param(2, "position", "The position percent to set.");
        tspp::describe(ns->function("YGNodeStyleGetPosition", &YGNodeStyleGetPosition))
            .param(0, "node", "The node to get the position from.")
            .param(1, "edge", "The edge to get.");
        tspp::describe(ns->function("YGNodeStyleSetPositionAuto", &YGNodeStyleSetPositionAuto))
            .param(0, "node", "The node to set the position auto on.")
            .param(1, "edge", "The edge to set.");
        tspp::describe(ns->function("YGNodeStyleSetMargin", &YGNodeStyleSetMargin))
            .param(0, "node", "The node to set the margin on.")
            .param(1, "edge", "The edge to set.")
            .param(2, "margin", "The margin to set.");
        tspp::describe(ns->function("YGNodeStyleSetMarginPercent", &YGNodeStyleSetMarginPercent))
            .param(0, "node", "The node to set the margin percent on.")
            .param(1, "edge", "The edge to set.")
            .param(2, "margin", "The margin percent to set.");
        tspp::describe(ns->function("YGNodeStyleSetMarginAuto", &YGNodeStyleSetMarginAuto))
            .param(0, "node", "The node to set the margin auto on.")
            .param(1, "edge", "The edge to set.");
        tspp::describe(ns->function("YGNodeStyleGetMargin", &YGNodeStyleGetMargin))
            .param(0, "node", "The node to get the margin from.")
            .param(1, "edge", "The edge to get.");
        tspp::describe(ns->function("YGNodeStyleSetPadding", &YGNodeStyleSetPadding))
            .param(0, "node", "The node to set the padding on.")
            .param(1, "edge", "The edge to set.")
            .param(2, "padding", "The padding to set.");
        tspp::describe(ns->function("YGNodeStyleSetPaddingPercent", &YGNodeStyleSetPaddingPercent))
            .param(0, "node", "The node to set the padding percent on.")
            .param(1, "edge", "The edge to set.")
            .param(2, "padding", "The padding percent to set.");
        tspp::describe(ns->function("YGNodeStyleGetPadding", &YGNodeStyleGetPadding))
            .param(0, "node", "The node to get the padding from.")
            .param(1, "edge", "The edge to get.");
        tspp::describe(ns->function("YGNodeStyleSetBorder", &YGNodeStyleSetBorder))
            .param(0, "node", "The node to set the border on.")
            .param(1, "edge", "The edge to set.")
            .param(2, "border", "The border to set.");
        tspp::describe(ns->function("YGNodeStyleGetBorder", &YGNodeStyleGetBorder))
            .param(0, "node", "The node to get the border from.")
            .param(1, "edge", "The edge to get.");
        tspp::describe(ns->function("YGNodeStyleSetGap", &YGNodeStyleSetGap))
            .param(0, "node", "The node to set the gap on.")
            .param(1, "gutter", "The gutter to set.")
            .param(2, "gapLength", "The gap length to set.");
        tspp::describe(ns->function("YGNodeStyleSetGapPercent", &YGNodeStyleSetGapPercent))
            .param(0, "node", "The node to set the gap percent on.")
            .param(1, "gutter", "The gutter to set.")
            .param(2, "gapLength", "The gap length percent to set.");
        tspp::describe(ns->function("YGNodeStyleGetGap", &YGNodeStyleGetGap))
            .param(0, "node", "The node to get the gap from.")
            .param(1, "gutter", "The gutter to get.");
        tspp::describe(ns->function("YGNodeStyleSetBoxSizing", &YGNodeStyleSetBoxSizing))
            .param(0, "node", "The node to set the box sizing on.")
            .param(1, "boxSizing", "The box sizing to set.");
        tspp::describe(ns->function("YGNodeStyleGetBoxSizing", &YGNodeStyleGetBoxSizing))
            .param(0, "node", "The node to get the box sizing from.");
        tspp::describe(ns->function("YGNodeStyleSetWidth", &YGNodeStyleSetWidth))
            .param(0, "node", "The node to set the width on.")
            .param(1, "width", "The width to set.");
        tspp::describe(ns->function("YGNodeStyleSetWidthPercent", &YGNodeStyleSetWidthPercent))
            .param(0, "node", "The node to set the width percent on.")
            .param(1, "width", "The width percent to set.");
        tspp::describe(ns->function("YGNodeStyleSetWidthAuto", &YGNodeStyleSetWidthAuto))
            .param(0, "node", "The node to set the width auto on.");
        tspp::describe(ns->function("YGNodeStyleGetWidth", &YGNodeStyleGetWidth))
            .param(0, "node", "The node to get the width from.");
        tspp::describe(ns->function("YGNodeStyleSetHeight", &YGNodeStyleSetHeight))
            .param(0, "node", "The node to set the height on.")
            .param(1, "height", "The height to set.");
        tspp::describe(ns->function("YGNodeStyleSetHeightPercent", &YGNodeStyleSetHeightPercent))
            .param(0, "node", "The node to set the height percent on.")
            .param(1, "height", "The height percent to set.");
        tspp::describe(ns->function("YGNodeStyleSetHeightAuto", &YGNodeStyleSetHeightAuto))
            .param(0, "node", "The node to set the height auto on.");
        tspp::describe(ns->function("YGNodeStyleGetHeight", &YGNodeStyleGetHeight))
            .param(0, "node", "The node to get the height from.");
        tspp::describe(ns->function("YGNodeStyleSetMinWidth", &YGNodeStyleSetMinWidth))
            .param(0, "node", "The node to set the min width on.")
            .param(1, "minWidth", "The min width to set.");
        tspp::describe(ns->function("YGNodeStyleSetMinWidthPercent", &YGNodeStyleSetMinWidthPercent))
            .param(0, "node", "The node to set the min width percent on.")
            .param(1, "minWidth", "The min width percent to set.");
        tspp::describe(ns->function("YGNodeStyleGetMinWidth", &YGNodeStyleGetMinWidth))
            .param(0, "node", "The node to get the min width from.");
        tspp::describe(ns->function("YGNodeStyleSetMinHeight", &YGNodeStyleSetMinHeight))
            .param(0, "node", "The node to set the min height on.")
            .param(1, "minHeight", "The min height to set.");
        tspp::describe(ns->function("YGNodeStyleSetMinHeightPercent", &YGNodeStyleSetMinHeightPercent))
            .param(0, "node", "The node to set the min height percent on.")
            .param(1, "minHeight", "The min height percent to set.");
        tspp::describe(ns->function("YGNodeStyleGetMinHeight", &YGNodeStyleGetMinHeight))
            .param(0, "node", "The node to get the min height from.");
        tspp::describe(ns->function("YGNodeStyleSetMaxWidth", &YGNodeStyleSetMaxWidth))
            .param(0, "node", "The node to set the max width on.")
            .param(1, "maxWidth", "The max width to set.");
        tspp::describe(ns->function("YGNodeStyleSetMaxWidthPercent", &YGNodeStyleSetMaxWidthPercent))
            .param(0, "node", "The node to set the max width percent on.")
            .param(1, "maxWidth", "The max width percent to set.");
        tspp::describe(ns->function("YGNodeStyleGetMaxWidth", &YGNodeStyleGetMaxWidth))
            .param(0, "node", "The node to get the max width from.");
        tspp::describe(ns->function("YGNodeStyleSetMaxHeight", &YGNodeStyleSetMaxHeight))
            .param(0, "node", "The node to set the max height on.")
            .param(1, "maxHeight", "The max height to set.");
        tspp::describe(ns->function("YGNodeStyleSetMaxHeightPercent", &YGNodeStyleSetMaxHeightPercent))
            .param(0, "node", "The node to set the max height percent on.")
            .param(1, "maxHeight", "The max height percent to set.");
        tspp::describe(ns->function("YGNodeStyleGetMaxHeight", &YGNodeStyleGetMaxHeight))
            .param(0, "node", "The node to get the max height from.");
        tspp::describe(ns->function("YGNodeStyleSetAspectRatio", &YGNodeStyleSetAspectRatio))
            .param(0, "node", "The node to set the aspect ratio on.")
            .param(1, "aspectRatio", "The aspect ratio to set.");
        tspp::describe(ns->function("YGNodeStyleGetAspectRatio", &YGNodeStyleGetAspectRatio))
            .param(0, "node", "The node to get the aspect ratio from.");
    }

    void bindYogaInterface() {
        bind::Namespace* ns = new bind::Namespace("yoga");
        bind::Registry::Add(ns);

        ns->opaqueType<YGConfigRef>("YGConfigRef");
        ns->opaqueType<YGConfigConstRef>("YGConfigConstRef");
        ns->opaqueType<YGNodeRef>("YGNodeRef");
        ns->opaqueType<YGNodeConstRef>("YGNodeConstRef");

        bindEnums(ns);

        bind::ObjectTypeBuilder<YGValue> v = ns->type<YGValue>("YGValue");
        v.prop("value", &YGValue::value);
        v.prop("unit", &YGValue::unit);

        bindConfig(ns);
        bindNode(ns);
        bindNodeLayout(ns);
        bindNodeStyle(ns);

        tspp::describe(ns->function("YGRoundValueToPixelGrid", &YGRoundValueToPixelGrid))
            .desc("Rounds a value to the nearest whole pixel, given a point scale factor describing pixel density.")
            .param(0, "value", "The value to round.")
            .param(1, "pointScaleFactor", "The point scale factor to use.")
            .param(2, "forceCeil", "Whether to force the value to be rounded up.")
            .param(3, "forceFloor", "Whether to force the value to be rounded down.")
            .returns("The rounded value in points.");
    }
}