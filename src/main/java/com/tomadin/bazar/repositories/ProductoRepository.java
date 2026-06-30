package com.tomadin.bazar.repositories;

import com.tomadin.bazar.entities.Producto;
import com.tomadin.bazar.enums.EstadoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByEstado(EstadoProducto estado);

    List<Producto> findByEstadoAndCantidadDisponibleLessThan(EstadoProducto estado, Long umbral);
}
