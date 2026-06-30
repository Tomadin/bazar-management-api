package com.tomadin.bazar.controllers;

import com.tomadin.bazar.dtos.request.VentaRequest;
import com.tomadin.bazar.dtos.response.DetalleVentaResponse;
import com.tomadin.bazar.dtos.response.MayorVentaResponse;
import com.tomadin.bazar.dtos.response.ResumenVentasDiaResponse;
import com.tomadin.bazar.dtos.response.VentaResponse;
import com.tomadin.bazar.services.VentaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ventas")
public class VentaController {
    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    public ResponseEntity<List<VentaResponse>> findAll() {
        return ResponseEntity.ok(ventaService.getAll());
    }

    @GetMapping("/mayor_venta")
    public ResponseEntity<MayorVentaResponse> mayorVenta() {
        return ResponseEntity.ok(ventaService.getMayorVenta());
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<ResumenVentasDiaResponse> resumenPorFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(ventaService.getResumenDelDia(fecha));
    }

    @GetMapping("/productos/{codigoVenta}")
    public ResponseEntity<List<DetalleVentaResponse>> productosDeVenta(@PathVariable Long codigoVenta) {
        return ResponseEntity.ok(ventaService.getProductosDeVenta(codigoVenta));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponse> findOne(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.getById(id));
    }

    @PostMapping
    public ResponseEntity<VentaResponse> save(@Valid @RequestBody VentaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.save(request));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<VentaResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.cancel(id));
    }
}
