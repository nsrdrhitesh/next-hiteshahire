import Swal, { SweetAlertIcon } from 'sweetalert2';

export const showSuccess = (message = "Operation completed successfully") => {
  return Swal.fire({
    title: "Success!",
    text: message,
    icon: "success",
    confirmButtonColor: "#7c3aed",
    timer: 1000,
    showConfirmButton: false,
  });
};

export const showError = (message = "Something went wrong") => {
  return Swal.fire({
    title: "Error",
    text: message,
    icon: "error",
    confirmButtonColor: "#ef4444",
  });
};


  // ── SweetAlert2 Success Message
  // await Swal.fire({
  //   title: "Success!",
  //   text: "Branding record created successfully",
  //   icon: "success",
  //   confirmButtonColor: "#7c3aed",           // violet-600 (or your primary color)
  //   confirmButtonText: "Great!",
  //   timer: 2200,                             // auto close after ~2.2s
  //   timerProgressBar: true,
  //   showConfirmButton: false,                // ← optional: hide button if using timer
  // });
  // Optional: error alert
  // Swal.fire({
  //   title: "Error",
  //   text: err.message || "Failed to create branding",
  //   icon: "error",
  //   confirmButtonColor: "#ef4444",
  // });