package com.tomadin.bazar.mappers;

import com.tomadin.bazar.dtos.response.VentaResponse;
import com.tomadin.bazar.entities.Venta;
import org.springframework.stereotype.Component;

@Component
public class VentaMapper {
    private final ClienteMapper clienteMapper;
    private final ProductoMapper productoMapper;

    public VentaMapper(ClienteMapper clienteMapper, ProductoMapper productoMapper) {
        this.clienteMapper = clienteMapper;
        this.productoMapper = productoMapper;
    }

    public VentaResponse toResponse(Venta venta){
        if (venta == null) {
            return null;
        }
        VentaResponse response = new VentaResponse();
        response.setFechaVenta(venta.getFechaVenta());
        response.setId(venta.getCodigoVenta());
        response.setTotal(venta.getTotal());
        response.setEstado(venta.getEstado());
        response.setCliente(clienteMapper.toResponse(venta.getCliente()));
        response.setProductos(
                venta.getListaProductos()
                        .stream()
                        .map(productoMapper::toResponse)
                        .toList()
        );
        return response;
    }
}
