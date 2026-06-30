package com.tomadin.bazar.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class VentaRequest {

    @NotEmpty(message = "La venta debe tener al menos un ítem.")
    @Valid
    private List<ItemVentaRequest> items;

    @NotNull(message = "El cliente es obligatorio.")
    private Long clienteId;
}
