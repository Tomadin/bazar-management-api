package com.tomadin.bazar.dtos.response;

import java.time.LocalDate;

public record ResumenVentasDiaResponse(
        LocalDate fecha,
        Long cantidadVentas,
        Double montoTotal
) {
}
