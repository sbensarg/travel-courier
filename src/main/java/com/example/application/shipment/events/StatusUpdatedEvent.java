package com.example.application.shipment.events;

import java.util.UUID;

public record StatusUpdatedEvent(
        UUID shipmentId,
        String newStatus
) {}