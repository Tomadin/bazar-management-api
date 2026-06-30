package com.tomadin.bazar.repositories;

import com.tomadin.bazar.entities.Cliente;
import com.tomadin.bazar.enums.EstadoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByDni(String dni);

    boolean existsByDniAndIdClienteNot(String dni, Long idCliente);

    List<Cliente> findByEstado(EstadoCliente estado);
}
