package com.tomadin.bazar.services;

import com.tomadin.bazar.dtos.request.VentaRequest;
import com.tomadin.bazar.dtos.response.VentaResponse;
import com.tomadin.bazar.entities.Cliente;
import com.tomadin.bazar.entities.Producto;
import com.tomadin.bazar.entities.Venta;
import com.tomadin.bazar.enums.EstadoVenta;
import com.tomadin.bazar.exceptions.ConflictException;
import com.tomadin.bazar.exceptions.NotFoundException;
import com.tomadin.bazar.mappers.VentaMapper;
import com.tomadin.bazar.repositories.ClienteRepository;
import com.tomadin.bazar.repositories.ProductoRepository;
import com.tomadin.bazar.repositories.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class VentaService implements IVentaService {
    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final VentaMapper ventaMapper;

    public VentaService(VentaRepository ventaRepository,
                        ClienteRepository clienteRepository,
                        ProductoRepository productoRepository,
                        VentaMapper ventaMapper) {
        this.ventaRepository = ventaRepository;
        this.clienteRepository = clienteRepository;
        this.productoRepository = productoRepository;
        this.ventaMapper = ventaMapper;
    }

    @Override
    @Transactional
    public VentaResponse save(VentaRequest request) {
        // Buscamos que el cliente exista en la BBDD
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new NotFoundException(
                        "Cliente no encontrado con el ID: " + request.getClienteId()));

        // Verificamos que los productos existan en la BBDD
        List<Producto> productos = productoRepository.findAllById(request.getProductoIds());
        if (productos.size() != request.getProductoIds().size()) {
            throw new NotFoundException("Uno o más productos no existen.");
        }

        // Calculamos el total atraves del costo de cada producto
        double total = productos.stream()
                .mapToDouble(Producto::getCosto)
                .sum();

        // seteamos los atributos de Venta
        Venta venta = new Venta();
        venta.setCliente(cliente);
        venta.setListaProductos(productos);
        venta.setTotal(total);
        venta.setFechaVenta(LocalDate.now());
        venta.setEstado(EstadoVenta.ACTIVA);

        // Persistimos
        Venta guardada = ventaRepository.save(venta);
        return ventaMapper.toResponse(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public VentaResponse getById(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(
                        "Venta no encontrada con el ID: " + id));
        return ventaMapper.toResponse(venta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaResponse> getAll() {
        return ventaRepository.findAll()
                .stream()
                .map(ventaMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public VentaResponse cancel(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(
                        "Venta no encontrada con el ID: " + id));

        if (venta.getEstado() == EstadoVenta.ANULADA) {
            throw new ConflictException("La venta ya se encuentra anulada.");
        }

        venta.setEstado(EstadoVenta.ANULADA);
        Venta anulada = ventaRepository.save(venta);
        return ventaMapper.toResponse(anulada);
    }
}
