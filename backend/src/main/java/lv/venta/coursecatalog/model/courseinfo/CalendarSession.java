package lv.venta.coursecatalog.model.courseinfo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@JsonIgnoreProperties(value = {"topic"}, allowSetters = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "calendar_sessions")
public class CalendarSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private CalendarTopic topic;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_type_id", nullable = false)
    private SessionType sessionType;

    @Column(nullable = false)
    private int academicHours;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}
