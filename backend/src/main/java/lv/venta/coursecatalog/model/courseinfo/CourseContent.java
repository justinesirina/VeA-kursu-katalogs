package lv.venta.coursecatalog.model.courseinfo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;

import java.time.LocalDateTime;

// courseInfo: iekļauts deserializācijā (allowSetters), izslēgts no serializācijas (novērš ByteBuddy)
@JsonIgnoreProperties(value = {"courseInfo"}, allowSetters = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"courseInfo"})
@Entity
@Table(name = "course_content")
public class CourseContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Kuram kursa versijas saturam pieder tēma
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_info_id", nullable = false)
    private CourseInfo courseInfo;

    // Tēmas secības numurs
    private int sequenceNumber;

    // Tēmas nosaukums
    @Column(nullable = false)
    private String topicTitle;

    // Tēmas apraksts (nav obligāts)
    @Column(columnDefinition = "TEXT")
    private String topicDescription;

    // Valoda: 'lv', 'en'
    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}
