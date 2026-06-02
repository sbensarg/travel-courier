package com.example.application.shipment;

import com.example.application.shipment.events.ShipmentCreatedEvent;
import com.example.application.shipment.events.StatusUpdatedEvent;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentService {

    private final ShipmentRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // SSE emitters list — one per connected browser tab
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void init() {
        log.info("🚀 ShipmentService initialized — Kafka listener should be active");
    }

    public List<Shipment> findAll() {
        return repository.findAll();
    }

    public Shipment create(Shipment shipment) {
        Shipment saved = repository.save(shipment);
        // Publish Kafka event
        kafkaTemplate.send("shipment-created",
                new ShipmentCreatedEvent(
                        saved.getId(),
                        saved.getTrackingNumber(),
                        saved.getDestination()
                )
        );
        log.info("Published ShipmentCreatedEvent for {}", saved.getTrackingNumber());
        return saved;
    }

    // Kafka consumer — listens for shipment-created events
    @KafkaListener(
            topics = "shipment-created",
            groupId = "travel-courier-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void onShipmentCreated(ShipmentCreatedEvent event) {
        log.info("🎯 Received ShipmentCreatedEvent for {}", event.trackingNumber());
        repository.findById(event.shipmentId()).ifPresent(shipment -> {
            log.info("📦 Found shipment, updating status to IN_TRANSIT");
            shipment.setStatus("IN_TRANSIT");
            repository.save(shipment);
            pushStatusUpdate(new StatusUpdatedEvent(shipment.getId(), "IN_TRANSIT"));
        });
    }

    // SSE — register new browser connection
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

    // SSE — push update to all connected browsers
    private void pushStatusUpdate(StatusUpdatedEvent event) {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().data(event));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        });
        emitters.removeAll(deadEmitters);
    }
}

