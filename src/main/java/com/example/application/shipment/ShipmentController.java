package com.example.application.shipment;

import com.example.application.shipment.events.StatusUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService service;

    @GetMapping
    public List<Shipment> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Shipment create(@RequestBody Shipment shipment) {
        return service.create(shipment);
    }

    // 🔥 SSE endpoint — browser connects here for live updates
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return service.subscribe();
    }
}