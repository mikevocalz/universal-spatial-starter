// @acme/ui — pure presentational components (depends only on theme).
// Primitives: '@acme/ui/primitives' · styling wrappers: '@acme/ui/tw'.

// layout
export { Container, type ContainerProps } from './layout/Container';

// core
export { Text, type TextProps } from './Text';
export { Heading, type HeadingProps } from './Heading';
export { Button, type ButtonProps } from './Button';
export { LinkButton, type LinkButtonProps, type LinkButtonVariant } from './LinkButton';
export { IconButton, type IconButtonProps } from './IconButton';
export { Card, type CardProps } from './Card';
export { Badge, type BadgeProps } from './Badge';
export { Avatar, AVATAR_GRADIENTS, type AvatarProps, type AvatarGradient, type AvatarGradientPreset, type AvatarVariant } from './Avatar';
export { Image, type ImageProps } from './Image';

// forms
export { TextField, type TextFieldProps, type PasteEventPayload } from './TextField';
export { Textarea, type TextareaProps } from './Textarea';
export { Select, type SelectProps } from './Select';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Switch, type SwitchProps } from './Switch';
export { FormField, type FormFieldProps } from './FormField';
export { ErrorMessage, type ErrorMessageProps } from './ErrorMessage';
export { SearchBar, type SearchBarProps } from './SearchBar';
export { DropZone, type DropZoneProps, type DropAsset } from './DropZone';
export { AuthProviderButton, type AuthProviderButtonProps, type AuthProvider, type AuthIntent } from './AuthProviderButton';
export { StatusRow, type StatusRowProps, type StatusRowItem, type StatusRowTone } from './StatusRow';
export { Banner, type BannerProps } from './Banner';
export { Timestamp, type TimestampProps } from './Timestamp';
export { Pagination, type PaginationProps } from './Pagination';
export { FilterBar, FilterChip, type FilterBarProps, type FilterChipProps } from './FilterBar';
export { KeyValueList, type KeyValueItem, type KeyValueListProps } from './KeyValueList';
export { MaskedValue, type MaskedValueProps } from './MaskedValue';
export { CopyButton, type CopyButtonProps } from './CopyButton';
export { ConfirmDestructive, type ConfirmDestructiveProps } from './ConfirmDestructive';
export { ResponsiveDialog, type ResponsiveDialogProps } from './ResponsiveDialog';
export { Checklist, CheckRow, type ChecklistProps, type CheckResult, type CheckRowProps } from './Checklist';
export { NotificationPreview, type NotificationPreviewProps } from './NotificationPreview';
export { YearGrid, type YearGridProps, type YearGridStep } from './YearGrid';

// feedback
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { LoadingSkeleton, type LoadingSkeletonProps } from './LoadingSkeleton';
export { Toast, type ToastProps } from './Toast';
export { ToastCard, type ToastCardProps } from './ToastCard';
export { notify, Toaster } from './notify';
export type { NotifyOptions, NotifyVariant } from './notify.shared';

// overlays + nav
export { Modal, type ModalProps } from './Modal';
export { Dialog, DialogCard, type DialogProps } from './Dialog';
export { Lightbox, type LightboxProps } from './Lightbox';
export { BottomSheet, SheetSurface, type BottomSheetProps } from './BottomSheet';
export { TabBar, type TabBarProps } from './TabBar';
export { Toolbar, type ToolbarProps } from './Toolbar';
export { TabBarAccessory, type TabBarAccessoryProps } from './TabBarAccessory';

// data
export { VirtualList, type VirtualListProps } from './VirtualList';
export { DataTable, type DataTableProps, type ColumnDef, type DataTableMode, type DataTableSelection, type SortState } from './DataTable';
export { useAppForm, withForm, useFieldContext, useFormContext, useFormStore } from './form';

export { SafeArea, type SafeAreaProps } from './SafeArea';
// Native phones use bottom tabs; native foldables, tablets and headsets use
// physical right rails. Web uses header navigation with phone-width tabs.
// The heavier pane host stays behind the '@acme/ui/adaptive-panes' subpath.
export * from './adaptive-navigation';
export { useAdaptiveNavigationPlacement } from './use-adaptive-navigation-placement';
export {
  useReservedRegions,
  type FoldOcclusionType,
  type FoldOrientation,
  type FoldState,
  type ReservedRegion,
} from './reserved-regions';
export { useWindowSizeClass, windowSizeClassForWidth } from './adaptive-panes/use-window-size-class';
export type { WindowSizeClass } from './adaptive-panes/constants';
export { KeyboardAwareScroll, type KeyboardAwareScrollProps } from './keyboard-aware';
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption } from './SegmentedControl';
export { FieldGroup, type FieldGroupProps, type FieldSectionProps } from './FieldGroup';
export { Slider, type SliderProps } from './Slider';
export { Collapsible, type CollapsibleProps } from './Collapsible';
export { List, ListItem, type ListProps, type ListItemProps } from './List';
export { NativeSlot, type NativeSlotProps } from './NativeSlot';
export { Menu, type MenuProps, type MenuAction } from './Menu';
export { useSizeClass, type SizeClass } from './use-size-class';
export {
  Motion, AnimatePresence, createMotionComponent, createMotionAnimatedComponent,
  motion, MotionView, MotionText, FadeIn, ScaleIn, SlideUp, useHydrated,
  type MotionViewProps, type MotionTextProps, type MotionPresetProps,
} from './motion';
export { PressScale, type PressScaleProps } from './press-scale';
export { useInstanceStore, useStore } from './use-instance-store';
export * from './audio';

// three.js on WebGPURenderer (WebGPU, WebGL2 on web without it, react-native-webgpu on native). Also '@acme/ui/three'.
export { HolographicTerrain, type HolographicTerrainProps } from './three/HolographicTerrain';
export { ThreeCanvas } from './three/ThreeCanvas';
export type { ThreeBackend, ThreeCanvasHandle, ThreeCanvasProps, ThreeContext, ThreeFrame, ThreePointer, ThreeScene, ThreeSetup } from './three/types';
export { LazyScene, type LazySceneProps, type LazySceneState } from './backgrounds/LazyScene';
export { SceneSection, type SceneSectionProps } from './backgrounds/SceneSection';
export { useInView } from './backgrounds/use-in-view';
export { useReducedMotion } from './backgrounds/use-reduced-motion';
export type { InView, InViewOptions } from './backgrounds/use-in-view.types';
// Districts and tones: one module for the whole kit.
export {
  DISTRICTS, DISTRICT_NAME, DISTRICT_NAMES, TONES, CONTROL_TONES, DISTRICT_TONES, DISTRICT_TONE, TONE_CLASSES,
  resolveTone, resolveControlTone, resolveAccent, toneClasses, toneVariants, toneHex, toneInput,
  DISTRICT_CHART_TONE, DISTRICT_LIGHT, districtSeries, districtTone, seriesColor, seriesShades, keylineFor,
  THEMES, THEMES as DISTRICT_THEMES, steps, skyBands,
  type District, type Tone, type ControlTone, type ToneClasses, type ToneHex, type DistrictTheme,
} from './district';
// ChartTone is exported once, through './charts'.
export { CircuitButton, type CircuitButtonProps, type CircuitTone, GridCard, type GridCardProps } from './future';

// GPU surface (WebGPU + TypeGPU, web and native) and the neon primitives the
// NeonBlade ports build on. Also importable as '@acme/ui/gpu' and '@acme/ui/neon'.
export * from './gpu';
export * from './neon';
export { useLayoutSize, type LayoutSize } from './use-layout-size';

// NeonBlade control and card ports (tones, frames, CardSlider).
export * from './cards';
// NeonBlade ports: charts and web/pointer cursors.
export * from './charts';
export * from './cursors';
export type { TextEffectOptions, GlitchIntensity, GlitchSpeed, TextGlowLevel } from './text-effects';
export { useSafeInsets } from './use-safe-insets';

export { EditorialCard } from './EditorialCard';
