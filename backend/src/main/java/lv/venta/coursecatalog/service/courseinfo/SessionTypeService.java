package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.SessionType;
import lv.venta.coursecatalog.repository.courseinfo.SessionTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SessionTypeService {

    @Autowired
    private SessionTypeRepository typeRepo;

    public List<SessionType> getAll() {
        return typeRepo.findAll();
    }

    public SessionType getById(int id) {
        return typeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts sesijas veids ar id = " + id));
    }

    @Transactional
    public SessionType create(SessionType type) {
        return typeRepo.save(type);
    }

    @Transactional
    public SessionType update(int id, SessionType updated) {
        SessionType existing = getById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return typeRepo.save(existing);
    }

    @Transactional
    public void delete(int id) {
        if (!typeRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais sesijas veids ar id = " + id);
        }
        typeRepo.deleteById(id);
    }
}
