package com.tomadin.bazar.dtos.response;

import com.tomadin.bazar.enums.EstadoVenta;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class VentaResponse {
    private Long id;
    private LocalDate fechaVenta;
    private Double total;
    private EstadoVenta estado;
    private ClienteResponse cliente;
    private List<ProductoResponse> productos;
}
