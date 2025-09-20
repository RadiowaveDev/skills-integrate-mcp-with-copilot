document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participantes
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
                <h5>Participantes:</h5>
                <ul class="participants-list">
                  ${details.participants
                    .map(
                      (email) =>
                        `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                    )
                    .join("")}
                </ul>
              </div>`
            : `<p><em>No hay participantes aún</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Horario:</strong> ${details.schedule}</p>
          <p><strong>Disponibilidad:</strong> ${spotsLeft} lugares libres</p>
          <div class="participants-container">${participantsHTML}</div>
          <button class="signup-btn" data-activity="${name}">Registrar estudiante</button>
        `;

        activitiesList.appendChild(activityCard);
      });

      // Botón de eliminar participante
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });

      // Botón de registro por actividad
      document.querySelectorAll(".signup-btn").forEach((button) => {
        button.addEventListener("click", handleSignup);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>No se pudieron cargar las actividades. Intenta más tarde.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Nuevo registro por tarjeta
  async function handleSignup(event) {
    const activity = event.target.getAttribute("data-activity");
    const email = prompt(
      "Ingresa el correo del estudiante para registrar en " + activity
    );
    if (!email) return;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Ocurrió un error";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "No se pudo registrar. Intenta de nuevo.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  }

  // Initialize app
  fetchActivities();
});
