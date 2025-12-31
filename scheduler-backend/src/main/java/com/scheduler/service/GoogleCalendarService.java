package com.scheduler.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.Map;

@Service
@Slf4j
public class GoogleCalendarService {

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String APPLICATION_NAME = "Scheduler App";

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    public String getAuthorizationUrl() throws GeneralSecurityException, IOException {
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setInstalled(details);

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport,
                JSON_FACTORY,
                clientSecrets,
                Collections.singletonList(CalendarScopes.CALENDAR)
        ).setAccessType("offline").build();

        return flow.newAuthorizationUrl().setRedirectUri(redirectUri).build();
    }

    public String exchangeCodeForToken(String code) throws GeneralSecurityException, IOException {
        Map<String, String> tokens = exchangeCodeForTokens(code);
        return tokens.get("accessToken");
    }

    public Map<String, String> exchangeCodeForTokens(String code) throws GeneralSecurityException, IOException {
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setInstalled(details);

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport,
                JSON_FACTORY,
                clientSecrets,
                Collections.singletonList(CalendarScopes.CALENDAR)
        ).setAccessType("offline")
         .setApprovalPrompt("force")
         .build();

        GoogleTokenResponse tokenResponse = flow.newTokenRequest(code)
                .setRedirectUri(redirectUri)
                .execute();

        Map<String, String> tokens = new java.util.HashMap<>();
        tokens.put("accessToken", tokenResponse.getAccessToken());
        if (tokenResponse.getRefreshToken() != null) {
            tokens.put("refreshToken", tokenResponse.getRefreshToken());
        }

        return tokens;
    }

    public Event createCalendarEvent(String accessToken, String summary, String description,
                                     String attendeeEmail, LocalDateTime startTime,
                                     LocalDateTime endTime) throws GeneralSecurityException, IOException {

        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, request -> {
            request.getHeaders().setAuthorization("Bearer " + accessToken);
        }).setApplicationName(APPLICATION_NAME).build();

        Event event = new Event()
                .setSummary(summary)
                .setDescription(description);

        Date startDate = Date.from(startTime.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(endTime.atZone(ZoneId.systemDefault()).toInstant());

        EventDateTime start = new EventDateTime()
                .setDateTime(new DateTime(startDate))
                .setTimeZone("UTC");
        event.setStart(start);

        EventDateTime end = new EventDateTime()
                .setDateTime(new DateTime(endDate))
                .setTimeZone("UTC");
        event.setEnd(end);

        EventAttendee[] attendees = new EventAttendee[]{
                new EventAttendee().setEmail(attendeeEmail)
        };
        event.setAttendees(Arrays.asList(attendees));

        event.setConferenceData(createConferenceData());

        String calendarId = "primary";
        event = service.events().insert(calendarId, event)
                .setConferenceDataVersion(1)
                .setSendUpdates("all")
                .execute();

        log.info("Event created: {}", event.getHtmlLink());
        return event;
    }

    public void deleteCalendarEvent(String accessToken, String eventId) throws GeneralSecurityException, IOException {
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, request -> {
            request.getHeaders().setAuthorization("Bearer " + accessToken);
        }).setApplicationName(APPLICATION_NAME).build();

        service.events().delete("primary", eventId).execute();
        log.info("Event deleted: {}", eventId);
    }

    private com.google.api.services.calendar.model.ConferenceData createConferenceData() {
        com.google.api.services.calendar.model.ConferenceData conferenceData =
                new com.google.api.services.calendar.model.ConferenceData();

        com.google.api.services.calendar.model.CreateConferenceRequest createRequest =
                new com.google.api.services.calendar.model.CreateConferenceRequest();
        createRequest.setRequestId(java.util.UUID.randomUUID().toString());

        // Specify Google Meet as the conference solution
        com.google.api.services.calendar.model.ConferenceSolutionKey solutionKey =
                new com.google.api.services.calendar.model.ConferenceSolutionKey();
        solutionKey.setType("hangoutsMeet");
        createRequest.setConferenceSolutionKey(solutionKey);

        conferenceData.setCreateRequest(createRequest);
        return conferenceData;
    }
}
