package com.tomadin.bazar.mappers;

import com.tomadin.bazar.dtos.request.ProductoRequest;
import com.tomadin.bazar.dtos.response.ProductoResponse;
import com.tomadin.bazar.entities.Producto;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public ProductoResponse toResponse(Producto producto) {
        if (producto == null) {
            return null;
        }
        ProductoResponse response = new ProductoResponse();
        response.setId(producto.getCodigoProducto());
        response.setNombre(producto.getNombre());
        response.setMarca(producto.getMarca());
        response.setCosto(producto.getCosto());
        response.setCantidadDisponible(producto.getCantidadDisponible());
        response.setEstado(producto.getEstado());
        return response;
    }

    public Producto toEntity(ProductoRequest request) {
        if (request == null) {
            return null;
        }
        Producto producto = new Producto();
        producto.setNombre(request.getNombre());
        producto.setMarca(request.getMarca());
        producto.setCosto(request.getCosto());
        producto.setCantidadDisponible(request.getCantidadDisponible());
        return producto;
    }

    public void updateEntityFromRequest(ProductoRequest request, Producto producto) {
        if (request == null || producto == null) {
            return;
        }
        producto.setNombre(request.getNombre());
        producto.setMarca(request.getMarca());
        producto.setCosto(request.getCosto());
        producto.setCantidadDisponible(request.getCantidadDisponible());
    }
}
