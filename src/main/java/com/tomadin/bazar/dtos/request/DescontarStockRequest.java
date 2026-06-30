package com.tomadin.bazar.dtos.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DescontarStockRequest {
    @NotNull(message = "La cantidad es obligatoria.")
    @Positive(message = "La cantidad a descontar debe ser mayor a cero.")
    private Long cantidad;
}
