package com.tomadin.bazar.dtos.request;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoRequest {
    @NotBlank(message = "El nombre no puede estar vacío.")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres.")
    private String nombre;
    @NotBlank(message = "La marca no puede estar vacía.")
    @Size(min = 2, max = 15, message = "La marca debe tener entre 2 y 15 caracteres.")
    private String marca;
    @DecimalMin(value = "0.01", message = "El costo debe ser mayor o igual a 0.01.")
    @Digits(integer = 6, fraction = 2, message = "El costo no puede superar los 6 dígitos enteros y 2 decimales.")
    @Positive
    private Double costo;
    @NotNull
    @PositiveOrZero
    private Long cantidadDisponible;
}
