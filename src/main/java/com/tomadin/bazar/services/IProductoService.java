package com.tomadin.bazar.services;

import com.tomadin.bazar.dtos.request.ProductoRequest;
import com.tomadin.bazar.dtos.response.ProductoResponse;

import java.util.List;

public interface IProductoService {
    public ProductoResponse save(ProductoRequest request);

    public ProductoResponse getById(Long id);

    public List<ProductoResponse> getAll(boolean incluirInactivos);

    public ProductoResponse update(Long id, ProductoRequest request);

    public ProductoResponse descontarStock(Long id, Long cantidad);

    public ProductoResponse activar(Long id);

    public void delete(Long id);

}
