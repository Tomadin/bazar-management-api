package com.tomadin.bazar.services;

import com.tomadin.bazar.dtos.request.ClienteRequest;
import com.tomadin.bazar.dtos.response.ClienteResponse;
import java.util.List;

public interface IClienteService {

    public ClienteResponse save(ClienteRequest request);

    public ClienteResponse getById(Long id);

    public List<ClienteResponse> getAll(boolean incluirInactivos);

    public ClienteResponse update(Long id, ClienteRequest request);

    public ClienteResponse activar(Long id);

    public void delete(Long id);

}
