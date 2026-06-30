package com.tomadin.bazar.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteRequest {
    @NotBlank(message = "El nombre no puede estar vacío.")
    @Size(min = 2, max = 12, message = "El nombre debe tener entre 2 y 12 caracteres.")
    private String nombre;
    @NotBlank(message = "El apellido no puede estar vacío.")
    @Size(min = 2, max = 12, message = "El apellido debe tener entre 2 y 12 caracteres.")
    private String apellido;
    @NotBlank(message = "El DNI no puede estar vacío.")
    @Pattern(regexp = "^[0-9]{8}$", message = "El DNI debe ser un número válido de 8 dígitos.")
    private String dni;
}
