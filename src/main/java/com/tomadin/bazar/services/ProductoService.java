package com.tomadin.bazar.services;

import com.tomadin.bazar.dtos.request.ProductoRequest;
import com.tomadin.bazar.dtos.response.ProductoResponse;
import com.tomadin.bazar.entities.Producto;
import com.tomadin.bazar.exceptions.NotFoundException;
import com.tomadin.bazar.mappers.ProductoMapper;
import com.tomadin.bazar.repositories.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService implements IProductoService {
    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    public ProductoService(ProductoRepository productoRepository, ProductoMapper productoMapper) {
        this.productoRepository = productoRepository;
        this.productoMapper = productoMapper;
    }

    @Override
    @Transactional
    public ProductoResponse save(ProductoRequest request) {
        Producto producto = productoMapper.toEntity(request);
        productoRepository.save(producto);
        return productoMapper.toResponse(producto);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponse getById(Long id) {
        return productoRepository.findById(id)
                .map(productoMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con el ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> getAll() {
        return productoRepository.findAll()
                .stream()
                .map(productoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductoResponse update(Long id, ProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con el ID: " + id));

        productoMapper.updateEntityFromRequest(request, producto);
        Producto actualizado = productoRepository.save(producto);
        return productoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new NotFoundException("Producto no encontrado con el ID: " + id);
        }
        productoRepository.deleteById(id);
    }
}
