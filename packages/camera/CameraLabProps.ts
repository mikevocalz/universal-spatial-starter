/**
 * Props for {@link CameraLab}, the full-screen Camera Lab overlay opened by
 * the raised Scan button.
 */
export interface CameraLabProps {
  /** Overlay visibility. The camera session exists only while open is true. */
  open: boolean;
  /**
   * Called when the user asks to leave (Close button, Android back). The
   * parent sets `open` to false; that unmount stops the camera stream and
   * releases the detector.
   */
  onClose: () => void;
}
