package com.tomadin.bazar.repositories;

import com.tomadin.bazar.entities.Venta;
import com.tomadin.bazar.enums.EstadoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    @Query("select count(v) as cantidad, coalesce(sum(v.total), 0.0) as monto " +
            "from Venta v where v.fechaVenta = :fecha and v.estado = :estado")
    ResumenVentasProjection resumenPorFecha(@Param("fecha") LocalDate fecha,
                                            @Param("estado") EstadoVenta estado);

    Optional<Venta> findTopByEstadoOrderByTotalDesc(EstadoVenta estado);
}
