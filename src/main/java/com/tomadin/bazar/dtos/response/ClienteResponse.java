package com.tomadin.bazar.dtos.response;

import com.tomadin.bazar.enums.EstadoCliente;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ClienteResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private EstadoCliente estado;
}
