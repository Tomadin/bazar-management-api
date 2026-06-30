package com.tomadin.bazar.dtos.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DetalleVentaResponse {
    private Long productoId;
    private String nombreProducto;
    private Long cantidad;
    private Double subtotal;
}
