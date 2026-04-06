import { Toast, toaster } from "@kobalte/core/toast";
import "./app-toast.css";

export const showToast = (data: {
  title: string;
  message: string;
  level: string;
}) => {
  const { title, message, level } = data;
  return toaster.show((props) => (
    <Toast toastId={props.toastId} class="toast">
      <div class="toast__content">
        <div>
          <Toast.Title class="toast__title">{title}</Toast.Title>
          <Toast.Description class="toast__description">
            {message}
          </Toast.Description>
        </div>
        <Toast.CloseButton class="toast__close-button">x</Toast.CloseButton>
      </div>
      <Toast.ProgressTrack class="toast__progress-track">
        <Toast.ProgressFill class="toast__progress-fill" />
      </Toast.ProgressTrack>
    </Toast>
  ));
};
