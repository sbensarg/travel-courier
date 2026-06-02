package com.example.application.shipment.events;

import java.util.UUID;

public record ShipmentCreatedEvent(
        UUID shipmentId,
        String trackingNumber,
        String destination
) {}