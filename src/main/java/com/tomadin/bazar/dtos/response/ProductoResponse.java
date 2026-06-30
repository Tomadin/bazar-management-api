package com.tomadin.bazar.dtos.response;

import com.tomadin.bazar.enums.EstadoProducto;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProductoResponse {
    private Long id;
    private String nombre;
    private String marca;
    private Double costo;
    private Long cantidadDisponible;
    private EstadoProducto estado;
}
