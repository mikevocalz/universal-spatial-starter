# Foldable and adaptive-layout work

Before designing, implementing, debugging, reviewing, testing or documenting foldables, dual screens, tablets, adaptive panes, resizing or shared XR panels, read the local [mikevocalz-foldable-layouts skill](.agents/skills/mikevocalz-foldable-layouts/SKILL.md) in full.

This is the canonical tailored skill for the shared starter and consuming repositories. It adapts FloWritesCode/fwc-swiftui-skills to this project's Expo/React Native architecture; it does not replace the app with SwiftUI.

Hardware family chooses native navigation: ordinary phones use bottom tabs; foldables (including folded covers and tabletop), tablets and headsets keep a physical RIGHT rail, including RTL. Available usable space determines content panes independently. Web keeps its persistent header and phone-width bottom tabs, never a side rail.

Preserve existing screen-specific contracts, Expo Router ownership, SplitView/AdaptivePanes, Zustand/refs, semantic UI, Kinetrell and platform adapters. Do not globalize another screen's pane ratios. Follow the skill's hinge/occlusion, state-continuity, accessibility and platform-verification requirements. Read relevant existing specialist skills as directed there.

For cross-repository consumers, pin the canonical skill to a reviewed commit and record updates explicitly. Do not silently follow a moving branch or describe an external reference as a local installation. No runtime changes, dependency upgrades, merges or deployments solely for a skills-only task.
