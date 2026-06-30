package com.tomadin.bazar.controllers;

import com.tomadin.bazar.dtos.request.DescontarStockRequest;
import com.tomadin.bazar.dtos.request.ProductoRequest;
import com.tomadin.bazar.dtos.response.ProductoResponse;
import com.tomadin.bazar.services.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductoController {
    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> findAll(
            @RequestParam(defaultValue = "false") boolean incluirInactivos) {
        return ResponseEntity.ok(productoService.getAll(incluirInactivos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> findOne(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> save(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.save(request));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductoResponse> descontarStock(@PathVariable Long id,
                                                           @Valid @RequestBody DescontarStockRequest request) {
        return ResponseEntity.ok(productoService.descontarStock(id, request.getCantidad()));
    }

    @PatchMapping("/{id}/activar")
    public ResponseEntity<ProductoResponse> activar(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.activar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
