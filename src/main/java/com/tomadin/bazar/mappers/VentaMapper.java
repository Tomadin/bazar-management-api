package com.tomadin.bazar.mappers;

import com.tomadin.bazar.dtos.response.DetalleVentaResponse;
import com.tomadin.bazar.dtos.response.VentaResponse;
import com.tomadin.bazar.entities.DetalleVenta;
import com.tomadin.bazar.entities.Venta;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VentaMapper {
    private final ClienteMapper clienteMapper;

    public VentaMapper(ClienteMapper clienteMapper) {
        this.clienteMapper = clienteMapper;
    }

    public VentaResponse toResponse(Venta venta) {
        if (venta == null) {
            return null;
        }
        VentaResponse response = new VentaResponse();
        response.setId(venta.getCodigoVenta());
        response.setFechaVenta(venta.getFechaVenta());
        response.setTotal(venta.getTotal());
        response.setEstado(venta.getEstado());
        response.setCliente(clienteMapper.toResponse(venta.getCliente()));
        response.setDetalles(
                venta.getDetalles()
                        .stream()
                        .map(this::toDetalleResponse)
                        .toList()
        );
        return response;
    }

    public List<DetalleVentaResponse> toDetalleResponses(Venta venta) {
        return venta.getDetalles()
                .stream()
                .map(this::toDetalleResponse)
                .toList();
    }

    private DetalleVentaResponse toDetalleResponse(DetalleVenta detalle) {
        DetalleVentaResponse dto = new DetalleVentaResponse();
        dto.setProductoId(detalle.getProducto().getCodigoProducto());
        dto.setNombreProducto(detalle.getProducto().getNombre());
        dto.setCantidad(detalle.getCantidad());
        dto.setSubtotal(detalle.getSubtotal());
        return dto;
    }
}
