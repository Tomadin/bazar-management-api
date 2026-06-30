package com.tomadin.bazar.services;

import com.tomadin.bazar.dtos.request.ProductoRequest;
import com.tomadin.bazar.dtos.response.ProductoResponse;
import com.tomadin.bazar.entities.Producto;
import com.tomadin.bazar.enums.EstadoProducto;
import com.tomadin.bazar.exceptions.ConflictException;
import com.tomadin.bazar.exceptions.NotFoundException;
import com.tomadin.bazar.mappers.ProductoMapper;
import com.tomadin.bazar.repositories.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService implements IProductoService {
    private static final long UMBRAL_BAJO_STOCK = 15L;

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
        producto.setEstado(EstadoProducto.ACTIVO);
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
    public List<ProductoResponse> getAll(boolean incluirInactivos) {
        List<Producto> productos = incluirInactivos
                ? productoRepository.findAll()
                : productoRepository.findByEstado(EstadoProducto.ACTIVO);
        return productos.stream()
                .map(productoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> getBajoStock() {
        return productoRepository
                .findByEstadoAndCantidadDisponibleLessThan(EstadoProducto.ACTIVO, UMBRAL_BAJO_STOCK)
                .stream()
                .map(productoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductoResponse update(Long id, ProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con el ID: " + id));

        if (!producto.estaActivo()) {
            throw new ConflictException("El producto " + id + " está inactivo; reactivalo antes de editarlo.");
        }

        productoMapper.updateEntityFromRequest(request, producto);
        Producto actualizado = productoRepository.save(producto);
        return productoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public ProductoResponse descontarStock(Long id, Long cantidad) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con el ID: " + id));

        if (!producto.estaActivo()) {
            throw new ConflictException("El producto " + id + " está inactivo; no se puede ajustar su stock.");
        }

        producto.descontar(cantidad); // valida stock (409) y descuenta en un solo lugar

        Producto actualizado = productoRepository.save(producto);
        return productoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public ProductoResponse reponerStock(Long id, Long cantidad) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con el ID: " + id));

        if (!producto.estaActivo()) {
            throw new ConflictException("El producto " + id + " está inactivo; no se puede ajustar su stock.");
        }

        producto.reponer(cantidad);

        Producto actualizado = productoRepository.save(producto);
        return productoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public ProductoResponse activar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con el ID: " + id));

        if (producto.estaActivo()) {
            throw new ConflictException("El producto " + id + " ya está activo.");
        }

        producto.setEstado(EstadoProducto.ACTIVO);
        Producto activado = productoRepository.save(producto);
        return productoMapper.toResponse(activado);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con el ID: " + id));

        if (!producto.estaActivo()) {
            throw new ConflictException("El producto " + id + " ya está inactivo.");
        }

        producto.setEstado(EstadoProducto.INACTIVO);
        productoRepository.save(producto);
    }
}
