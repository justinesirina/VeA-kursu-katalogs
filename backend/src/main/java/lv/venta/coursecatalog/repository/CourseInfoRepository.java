package lv.venta.coursecatalog.repository;

import lv.venta.coursecatalog.model.CourseInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseInfoRepository extends JpaRepository<CourseInfo, UUID> {
    // Šeit vari vēlāk pievienot pielāgotas meklēšanas metodes
}
