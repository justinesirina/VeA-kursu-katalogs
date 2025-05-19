package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarSession;
import lv.venta.coursecatalog.repository.courseinfo.CalendarSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CalendarSessionService {

    @Autowired
    private CalendarSessionRepository sessionRepo;

    public List<CalendarSession> getAll() {
        return sessionRepo.findAll();
    }

    public CalendarSession getById(int id) {
        return sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasta nodarbība ar id = " + id));
    }

    @Transactional
    public CalendarSession create(CalendarSession session) {
        return sessionRepo.save(session);
    }

    @Transactional
    public CalendarSession update(int id, CalendarSession updated) {
        CalendarSession existing = getById(id);
        existing.setTopic(updated.getTopic());
        existing.setSessionType(updated.getSessionType());
        existing.setAcademicHours(updated.getAcademicHours());
        existing.setUpdatedAt(updated.getUpdatedAt());
        return sessionRepo.save(existing);
    }

    @Transactional
    public void delete(int id) {
        if (!sessionRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasta dzēšamā nodarbība ar id = " + id);
        }
        sessionRepo.deleteById(id);
    }
}
