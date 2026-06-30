package com.tomadin.bazar.dtos.response;

public record MayorVentaResponse(
        Long codigoVenta,
        Double total,
        Long cantidadProductos,
        String nombreCliente,
        String apellidoCliente
) {
}
