package com.tomadin.bazar.services;

import com.tomadin.bazar.dtos.request.ClienteRequest;
import com.tomadin.bazar.dtos.response.ClienteResponse;
import com.tomadin.bazar.entities.Cliente;
import com.tomadin.bazar.enums.EstadoCliente;
import com.tomadin.bazar.exceptions.ConflictException;
import com.tomadin.bazar.exceptions.NotFoundException;
import com.tomadin.bazar.mappers.ClienteMapper;
import com.tomadin.bazar.repositories.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ClienteService implements IClienteService {
    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    public ClienteService(ClienteRepository clienteRepository, ClienteMapper clienteMapper) {
        this.clienteRepository = clienteRepository;
        this.clienteMapper = clienteMapper;
    }

    @Override
    @Transactional
    public ClienteResponse save(ClienteRequest request) {
        if (clienteRepository.existsByDni(request.getDni())) {
            throw new ConflictException("Ya existe un cliente con el DNI: " + request.getDni());
        }
        Cliente cliente = clienteMapper.toEntity(request);
        cliente.setEstado(EstadoCliente.ACTIVO);
        clienteRepository.save(cliente);
        return clienteMapper.toResponse(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponse getById(Long id) {
        return clienteRepository.findById(id)
                .map(clienteMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con el ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponse> getAll(boolean incluirInactivos) {
        List<Cliente> clientes = incluirInactivos
                ? clienteRepository.findAll()
                : clienteRepository.findByEstado(EstadoCliente.ACTIVO);
        return clientes.stream()
                .map(clienteMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ClienteResponse update(Long id, ClienteRequest request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con el ID: " + id));

        if (!cliente.estaActivo()) {
            throw new ConflictException("El cliente " + id + " está inactivo; reactivalo antes de editarlo.");
        }

        if (clienteRepository.existsByDniAndIdClienteNot(request.getDni(), id)) {
            throw new ConflictException("Ya existe otro cliente con el DNI: " + request.getDni());
        }

        clienteMapper.updateEntityFromRequest(request, cliente);
        Cliente actualizado = clienteRepository.save(cliente);
        return clienteMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public ClienteResponse activar(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con el ID: " + id));

        if (cliente.estaActivo()) {
            throw new ConflictException("El cliente " + id + " ya está activo.");
        }

        cliente.setEstado(EstadoCliente.ACTIVO);
        Cliente activado = clienteRepository.save(cliente);
        return clienteMapper.toResponse(activado);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con el ID: " + id));

        if (!cliente.estaActivo()) {
            throw new ConflictException("El cliente " + id + " ya está inactivo.");
        }

        cliente.setEstado(EstadoCliente.INACTIVO);
        clienteRepository.save(cliente);
    }
}
