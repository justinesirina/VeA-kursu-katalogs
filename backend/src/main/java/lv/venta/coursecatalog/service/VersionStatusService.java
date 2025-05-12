package lv.venta.coursecatalog.service;

import lv.venta.coursecatalog.model.VersionStatus;
import lv.venta.coursecatalog.repository.VersionStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VersionStatusService {

    private final VersionStatusRepository repository;

    @Autowired
    public VersionStatusService(VersionStatusRepository repository) {
        this.repository = repository;
    }

    public List<VersionStatus> getAllStatuses() {
        return repository.findAll();
    }

    public VersionStatus saveStatus(VersionStatus status) {
        return repository.save(status);
    }

    public Optional<VersionStatus> getStatusById(int id) {
        return repository.findById(id);
    }

    public void deleteStatus(int id) {
        repository.deleteById(id);
    }
}
