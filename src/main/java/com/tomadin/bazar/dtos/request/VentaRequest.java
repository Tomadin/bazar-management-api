package com.tomadin.bazar.dtos.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class VentaRequest {

    @NotEmpty(message = "La venta debe tener al menos un producto.")
    private List<Long> productoIds;

    @NotNull(message = "El cliente es obligatorio.")
    private Long clienteId;
}

