package com.tomadin.bazar.mappers;

import com.tomadin.bazar.dtos.request.ClienteRequest;
import com.tomadin.bazar.dtos.response.ClienteResponse;
import com.tomadin.bazar.entities.Cliente;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public ClienteResponse toResponse(Cliente cliente) {
        if (cliente == null) {
            return null;
        }
        ClienteResponse response = new ClienteResponse();
        response.setId(cliente.getIdCliente());
        response.setNombre(cliente.getNombre());
        response.setApellido(cliente.getApellido());
        response.setDni(cliente.getDni());
        return response;
    }

    public Cliente toEntity(ClienteRequest request) {
        if (request == null) {
            return null;
        }
        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setDni(request.getDni());
        return cliente;
    }

    public void updateEntityFromRequest(ClienteRequest request, Cliente cliente) {
        if (request == null || cliente == null) {
            return;
        }
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setDni(request.getDni());
    }
}
