package com.tomadin.bazar.dtos.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReponerStockRequest {
    @NotNull(message = "La cantidad es obligatoria.")
    @Positive(message = "La cantidad a reponer debe ser mayor a cero.")
    private Long cantidad;
}
