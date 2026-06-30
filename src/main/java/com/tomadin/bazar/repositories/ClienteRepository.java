package com.tomadin.bazar.repositories;

import com.tomadin.bazar.entities.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByDni(String dni);

    boolean existsByDniAndIdClienteNot(String dni, Long idCliente);
}
