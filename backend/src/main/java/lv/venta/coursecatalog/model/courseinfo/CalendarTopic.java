package lv.venta.coursecatalog.model.courseinfo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@JsonIgnoreProperties(value = {"courseInfo"}, allowSetters = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "calendar_topics")
public class CalendarTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_info_id", nullable = false)
    private CourseInfo courseInfo;

    private int sequenceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_content_id", nullable = false)
    private CourseContent courseContent;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private String language;
}
