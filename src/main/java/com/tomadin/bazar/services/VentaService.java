package com.tomadin.bazar.services;

import com.tomadin.bazar.dtos.request.ItemVentaRequest;
import com.tomadin.bazar.dtos.request.VentaRequest;
import com.tomadin.bazar.dtos.response.DetalleVentaResponse;
import com.tomadin.bazar.dtos.response.MayorVentaResponse;
import com.tomadin.bazar.dtos.response.ResumenVentasDiaResponse;
import com.tomadin.bazar.dtos.response.VentaResponse;
import com.tomadin.bazar.entities.Cliente;
import com.tomadin.bazar.entities.DetalleVenta;
import com.tomadin.bazar.entities.Producto;
import com.tomadin.bazar.entities.Venta;
import com.tomadin.bazar.enums.EstadoVenta;
import com.tomadin.bazar.exceptions.ConflictException;
import com.tomadin.bazar.exceptions.NotFoundException;
import com.tomadin.bazar.mappers.VentaMapper;
import com.tomadin.bazar.repositories.ClienteRepository;
import com.tomadin.bazar.repositories.ProductoRepository;
import com.tomadin.bazar.repositories.ResumenVentasProjection;
import com.tomadin.bazar.repositories.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
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
        // El cliente debe existir
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new NotFoundException(
                        "Cliente no encontrado con el ID: " + request.getClienteId()));

        if (!cliente.estaActivo()) {
            throw new ConflictException(
                    "El cliente " + cliente.getIdCliente() + " está inactivo; no puede realizar compras.");
        }

        Venta venta = new Venta();
        venta.setCliente(cliente);
        venta.setFechaVenta(LocalDate.now());
        venta.setEstado(EstadoVenta.ACTIVA);

        double total = 0.0;
        List<DetalleVenta> detalles = new ArrayList<>();

        // Un renglón por ítem: valida + descuenta stock y calcula subtotal
        for (ItemVentaRequest item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new NotFoundException(
                            "Producto no encontrado con el ID: " + item.getProductoId()));

            if (!producto.estaActivo()) {
                throw new ConflictException(
                        "El producto " + producto.getCodigoProducto() + " está inactivo; no se puede vender.");
            }

            producto.descontar(item.getCantidad()); // valida stock (409) y descuenta

            double subtotal = producto.getCosto() * item.getCantidad();
            total += subtotal;

            DetalleVenta detalle = new DetalleVenta();
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setSubtotal(subtotal);
            detalle.setVenta(venta);
            detalles.add(detalle);
        }

        venta.setDetalles(detalles);
        venta.setTotal(total);

        Venta guardada = ventaRepository.save(venta); // cascade persiste los detalles
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

        // Devolvemos al stock lo que se había descontado
        for (DetalleVenta detalle : venta.getDetalles()) {
            detalle.getProducto().reponer(detalle.getCantidad());
        }

        venta.setEstado(EstadoVenta.ANULADA);
        Venta anulada = ventaRepository.save(venta);
        return ventaMapper.toResponse(anulada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetalleVentaResponse> getProductosDeVenta(Long codigoVenta) {
        Venta venta = ventaRepository.findById(codigoVenta)
                .orElseThrow(() -> new NotFoundException(
                        "Venta no encontrada con el ID: " + codigoVenta));
        return ventaMapper.toDetalleResponses(venta);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenVentasDiaResponse getResumenDelDia(LocalDate fecha) {
        ResumenVentasProjection resumen = ventaRepository.resumenPorFecha(fecha, EstadoVenta.ACTIVA);
        return new ResumenVentasDiaResponse(fecha, resumen.getCantidad(), resumen.getMonto());
    }

    @Override
    @Transactional(readOnly = true)
    public MayorVentaResponse getMayorVenta() {
        Venta venta = ventaRepository.findTopByEstadoOrderByTotalDesc(EstadoVenta.ACTIVA)
                .orElseThrow(() -> new NotFoundException("No hay ventas registradas."));

        long cantidadProductos = venta.getDetalles().stream()
                .mapToLong(DetalleVenta::getCantidad)
                .sum();

        Cliente cliente = venta.getCliente();
        return new MayorVentaResponse(
                venta.getCodigoVenta(),
                venta.getTotal(),
                cantidadProductos,
                cliente.getNombre(),
                cliente.getApellido()
        );
    }
}
