package com.tomadin.bazar.entities;

import com.tomadin.bazar.enums.EstadoProducto;
import com.tomadin.bazar.exceptions.ConflictException;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "productos")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo_producto")
    private Long codigoProducto;
    @Column(name = "nombre")
    private String nombre;
    @Column(name = "marca")
    private String marca;
    @Column(name = "costo")
    private Double costo;
    @Column(name = "cant_disponible")
    private Long cantidadDisponible;
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoProducto estado;

    public boolean estaActivo() {
        return estado == EstadoProducto.ACTIVO;
    }

    public void descontar(Long cantidad) {
        if (this.cantidadDisponible < cantidad) {
            throw new ConflictException(
                    "Stock insuficiente para el producto '" + nombre +
                            "': disponible " + cantidadDisponible + ", solicitado " + cantidad + ".");
        }
        this.cantidadDisponible -= cantidad;
    }

    public void reponer(Long cantidad) {
        this.cantidadDisponible += cantidad;
    }
}
