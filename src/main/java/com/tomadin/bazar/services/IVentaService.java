package com.tomadin.bazar.services;



import com.tomadin.bazar.dtos.request.VentaRequest;
import com.tomadin.bazar.dtos.response.VentaResponse;

import java.util.List;

public interface IVentaService {
    public VentaResponse save(VentaRequest request);

    public VentaResponse getById(Long id);

    public List<VentaResponse> getAll();

    public VentaResponse cancel(Long id);
}
